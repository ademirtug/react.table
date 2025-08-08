import { useState } from "react";
import ToastManager from '../utils/toastManager';


const styles = {
    disabled: {
        border: "none",
        background: "transparent",
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "inherit",
        color: "var(--bs-secondary-color)",
        outline: "none",
        fontStyle: "italic",
        pointerEvents: "none"
    },
    enabled: {
        border: "1px solid var(--bs-border-color)",
        background: "var(--bs-body-bg)",
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "inherit",
        color: "var(--bs-body-color)",
        outline: "none",
        borderRadius: "0.25rem"
    }
};

const TextCell = ({ value, onChange, isEditing, id, isReadOnly }) => (
    <input
        key={`${id}-text`}
        type="text"
        value={value || ''}
        onChange={onChange}
        style={isReadOnly ? styles.disabled : (isEditing ? styles.enabled : styles.disabled)}
        disabled={!isEditing || isReadOnly}
        className="form-control form-control-sm"
        title={isReadOnly ? "Read-only field" : ""}
    />
);

const CheckboxCell = ({ value, onChange, isEditing, isReadOnly }) => (
    <div className="form-check d-flex justify-content-center">
        <input
            type="checkbox"
            className="form-check-input"
            checked={value || false}
            onChange={onChange}
            disabled={!isEditing || isReadOnly}
            style={{ cursor: isReadOnly || !isEditing ? "default" : "pointer" }}
            title={isReadOnly ? "Read-only field" : ""}
        />
    </div>
);

const SelectCell = ({ value, options, onChange, isEditing, isReadOnly }) => (
    <select
        className="form-select form-select-sm"
        value={value || ''}
        onChange={onChange}
        disabled={!isEditing || isReadOnly}
        style={isReadOnly ? styles.disabled : (isEditing ? styles.enabled : styles.disabled)}
        title={isReadOnly ? "Read-only field" : ""}
    >
        {options?.map((option, index) => (
            <option key={index} value={option}>
                {option}
            </option>
        ))}
    </select>
);


export const Cell = ({ row, header, table }) => {
    const { handleChange } = table;

    const isReadOnly = !!header.readOnly;
    const isEditing = row.isEditing;

    const handleCellChange = (e) => {
        if (isReadOnly) return;
        const value = header.type === "checkbox" ? e.target.checked : e.target.value;
        handleChange(row.id, header.field, value);
    };

    switch (header.type) {
        case "text":
            return (
                <td>
                    <TextCell
                        value={row[header.field]}
                        onChange={handleCellChange}
                        isEditing={isEditing}
                        id={row.id}
                        isReadOnly={isReadOnly}
                    />
                </td>
            );

        case "checkbox":
            return (
                <td>
                    <CheckboxCell
                        value={row[header.field]}
                        onChange={handleCellChange}
                        isEditing={isEditing}
                        isReadOnly={isReadOnly}
                    />
                </td>
            );

        case "select":
            return (
                <td>
                    <SelectCell
                        value={row[header.field]}
                        options={header.options}
                        onChange={handleCellChange}
                        isEditing={isEditing}
                        isReadOnly={isReadOnly}
                    />
                </td>
            );

        default:
            return <td>{row[header.field]}</td>;
    }
};


export const Row = ({ row, headers, table }) => {
    const { updateRow, deleteRow, customActions } = table;

    const handleSave = async () => {
        const response = await updateRow(row);
        if (response.ok) {
            ToastManager.addToast("Saved successfully!", "success");
        } else {
            ToastManager.addToast(response.message || "Failed to save", "danger");
        }
    };

    const handleCancel = () => {
        if (row.isNew) {
            deleteRow(row.id);
        } else {
            table.toggleEditMode(row.id);
        }
    };

    const handleDelete = async () => {
        const name = row.name || `Row ${row.id}`;
        if (window.confirm(`Delete "${name}"?`)) {
            const response = await deleteRow(row.id);
            if (response.ok) {
                ToastManager.addToast("Deleted successfully!", "success");
            }
        }
    };

    return (
        <tr className="align-middle">
            {headers.map((header) => (
                <Cell key={`${row.id}-${header.field}`} row={row} header={header} table={table} />
            ))}
            <td style={{ width: "150px" }}>
                {row.isEditing ? (
                    <>
                        <i
                            className="fas fa-check me-3 text-success"
                            onClick={handleSave}
                            title="Save"
                            style={{ cursor: "pointer" }}
                        />
                        <i
                            className="fas fa-times me-3 text-warning"
                            onClick={handleCancel}
                            title="Cancel"
                            style={{ cursor: "pointer" }}
                        />

                        {customActions
                            .filter((action) => action.isEditOnly)
                            .map((action, index) => (
                                <i
                                    key={`edit-action-${index}`}
                                    className={`${action.icon} me-3`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => action.onClick(row, table)}
                                    title={action.title}
                                />
                            ))}
                    </>
                ) : (
                    <>
                        {customActions
                            .filter((action) => !action.isEditOnly)
                            .map((action, index) => (
                                <i
                                    key={`action-${index}`}
                                    className={`${action.icon} me-3`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => action.onClick(row, table)}
                                    title={action.title}
                                />
                            ))}

                        <i
                            className="fas fa-edit text-primary me-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => table.toggleEditMode(row.id)}
                            title="Edit"
                        />
                        <i
                            className="fas fa-trash text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={handleDelete}
                            title="Delete"
                        />
                    </>
                )}
            </td>
        </tr>
    );
};


export const Table = ({ table, headers }) => {
    const { tableData } = table;
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const totalRows = tableData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

    const goToPage = (pageNumber) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };

    const handleAddNewRow = () => {
        if (table.loading) {
            ToastManager.addToast("Table is still loading. Please wait.", "warning");
            return;
        }

        if (!Array.isArray(headers) || headers.length === 0) {
            ToastManager.addToast("Headers not available.", "danger");
            return;
        }

        const editingExists = table.tableData.some(row => row.isEditing);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit first.", "warning");
            return;
        }

        const success = table.addNewRow(headers);
        if (success) {
            const newRowPage = Math.ceil(tableData.length / rowsPerPage);
            goToPage(newRowPage);
        }
    };

    return (
        <div className="mt-4 card">
            <div className="card-header">
                <h4>Data Table</h4>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header.name}</th>
                                ))}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((row) => (
                                <Row key={row.id} row={row} headers={headers} table={table} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <nav>
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => goToPage(number)}>
                                            {number}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div>
                        <button className="btn btn-primary" onClick={handleAddNewRow}>
                            <i className="fas fa-plus me-2"></i>Add New Row
                        </button>
                    </div>
                </div>

                <div className="text-muted small mt-2">
                    Showing {totalRows > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, totalRows)} of {totalRows} entries
                </div>
            </div>
        </div>
    );
};