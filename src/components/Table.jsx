import { useState, useEffect } from "react";
import ToastManager from '../utils/toastManager';


const styles = {
    disabled: {
        boxSizing: "border-box",
        border: "1px solid var(--bs-border-color)",
        background: "var(--bs-tertiary-bg)",
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "inherit",
        color: "var(--bs-secondary-color)",
        pointerEvents: "none"
    },
    enabled: {
        border: "1px solid var(--bs-border-color)",
        background: "var(--bs-body-bg)",
        width: "100%",
        padding: "0.375rem 0.75rem",
        fontSize: "inherit",
        color: "var(--bs-body-color)",
        borderRadius: "0.25rem",
        boxSizing: "border-box" // ← Add this
    }
};

const TextCell = ({ value, onChange, isEditing, id, isReadOnly }) => (
    <input
        key={`${id}-text`}
        type="text"
        value={value || ''}
        onChange={onChange}
        style={isEditing ? (isReadOnly ? styles.disabled : styles.enabled) : styles.enabled}
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
        style={isEditing ? (isReadOnly ? styles.disabled : styles.enabled) : styles.enabled}
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


export const Row = ({ row, headers, table, actionColumnWidth }) => {
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
            <td style={{ width: actionColumnWidth, whiteSpace: "nowrap" }}>
                {row.isEditing ? (
                    <>

                        <i
                            className="fas fa-check me-3 "
                            onClick={handleSave}
                            title="Save"
                            style={{ cursor: "pointer" }}
                        />
                        <i
                            className="fas fa-times me-3"
                            onClick={handleCancel}
                            title="Cancel"
                            style={{ cursor: "pointer" }}
                        />
                        {customActions
                            .filter((action) => action.isEditAction)
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
                            .filter((action) => !action.isEditAction)
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
                            className="fas fa-edit me-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => table.toggleEditMode(row.id)}
                            title="Edit"
                        />
                        <i
                            className="fas fa-trash"
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


export const Table = ({ table, tableTitle, actionColumnWidth = 120 }) => {
    const { tableData } = table;
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const totalRows = tableData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

    const hasEditingRow = tableData.some(row => row.isEditing);
    const editingRow = tableData.find(row => row.isEditing);

    const goToPage = (pageNumber) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };

    useEffect(() => {
        if (!hasEditingRow) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                // Optional: Prevent conflict with modals
                const modalOpen = document.querySelector('.modal.show');
                if (modalOpen) return;

                // Cancel current edit
                if (editingRow) {
                    table.toggleEditMode(editingRow.id);
                    ToastManager.addToast("Edit cancelled.", "info");
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [hasEditingRow, editingRow, table]);

    const handleAddNewRow = () => {
        if (table.loading) {
            ToastManager.addToast("Table is still loading. Please wait.", "warning");
            return;
        }

        const editingExists = table.tableData.some(row => row.isEditing);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit first.", "warning");
            return;
        }

        const success = table.addNewRow();
        if (success) {
            const newRowPage = Math.ceil((tableData.length + 1) / rowsPerPage);
            goToPage(newRowPage);
        }
    };

    return (
        <div className="mt-4 card">
            {tableTitle && <div className="card-header">
                <h4>{tableTitle}</h4>
            </div>}

            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                {table.headers.map((header, index) => (
                                    <th key={index}>{header.name}</th>
                                ))}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((row) => (
                                <Row key={row.id} row={row} headers={table.headers} table={table} actionColumnWidth={actionColumnWidth} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <nav aria-label="Table pagination">
                            <ul className="pagination mb-0">
                                {/* Previous Button */}
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link text-body border"
                                        style={{ backgroundColor: 'var(--bs-secondary-bg, #e9ecef)' }}
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>
                                </li>

                                {/* Page Numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                        <button
                                            className={`page-link border ${currentPage === number
                                                ? 'bg-secondary text-white'  // ← Changed from primary to secondary
                                                : 'text-body bg-transparent'
                                                }`}
                                            style={{
                                                backgroundColor: currentPage === number
                                                    ? 'var(--bs-secondary)'
                                                    : 'var(--bs-secondary-bg, #e9ecef)'
                                            }}
                                            onClick={() => goToPage(number)}
                                            disabled={currentPage === number}
                                            aria-label={`Go to page ${number}`}
                                        >
                                            {number}
                                        </button>
                                    </li>
                                ))}

                                {/* Next Button */}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link text-body border"
                                        style={{ backgroundColor: 'var(--bs-secondary-bg, #e9ecef)' }}
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div className="d-flex gap-2">
                        {/* Default Add New Row Button */}
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleAddNewRow}>
                            <i className="fas fa-plus"></i>
                        </button>

                        {/* Custom Table Buttons */}
                        {table.customButtons.map((btn, index) => (
                            <button
                                key={`table-btn-${index}`}
                                className={`btn ${btn.variant || 'btn-outline-secondary'}`}
                                onClick={() => btn.onClick(table)}
                                title={btn.title}
                                disabled={btn.disabled}
                                style={{ whiteSpace: 'nowrap', ...btn.style }}
                            >
                                <i className={`${btn.icon} me-1`}></i>
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-muted small mt-2">
                    Showing {totalRows > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, totalRows)} of {totalRows} entries
                </div>
            </div>
        </div>
    );
};