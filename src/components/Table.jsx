import { useEffect } from "react";
import ToastManager from '../utils/toastManager';


const styles = {
    disabled: {
        boxSizing: "border-box",
        background: "var(--bs-tertiary-bg)",
        width: "100%",
        fontSize: "inherit",
        color: "var(--bs-secondary-color)",
        pointerEvents: "none"
    },
    enabled: {
        boxSizing: "border-box",
        background: "var(--bs-body-bg)",
        width: "100%",
        fontSize: "inherit",
        color: "var(--bs-body-color)",
        borderRadius: "0.25rem"
    }
};

const TextCell = ({ value, onChange, isEditing, id, isReadOnly }) => {
    if (!isEditing || isReadOnly) {
        return (
            <div
                className="px-3 py-2"
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    // ADD THIS TRANSPARENT BORDER TO MATCH EDIT MODE LAYOUT
                    border: '1px solid transparent'
                }}
            >
                {value || <span className="text-muted">—</span>}
            </div>
        );
    }

    return (
        <input
            key={`${id}-text`}
            type="text"
            value={value || ''}
            onChange={onChange}
            style={{
                ...styles.enabled,
                // EXPLICITLY SET BORDER TO OVERRIDE BOOTSTRAP
                border: '1px solid var(--bs-border-color)'
            }}
            className="form-control form-control-sm px-3 py-2"
        />
    );
};

const CheckboxCell = ({ value, onChange, isEditing, isReadOnly }) => {
    if (!isEditing || isReadOnly) {
        // View mode OR read-only: centered icon with border placeholder
        return (
            <div
                className="d-flex align-items-center justify-content-center px-3 py-2"
                style={{ border: '1px solid transparent' }} // Match edit mode layout
            >
                {value ? (
                    <i className="fas fa-check text-success"></i>
                ) : (
                    <i className="fas fa-times text-secondary"></i>
                )}
            </div>
        );
    }

    // Edit mode and editable: show checkbox with consistent layout
    return (
        <div
            className="d-flex align-items-center justify-content-center px-3 py-2"
            style={{ border: '1px solid transparent' }} // Visible border
        >
            <input
                type="checkbox"
                className="form-check-input"
                checked={value || false}
                onChange={onChange}
                style={{ cursor: "pointer" }}
            />
        </div>
    );
};
const SelectCell = ({ value, options, onChange, isEditing, isReadOnly }) => {
    const displayValue = options?.includes(value) ? value : <span className="text-muted">—</span>;

    if (!isEditing || isReadOnly) {
        // View mode OR read-only: display value only with border placeholder
        return (
            <div
                className="px-3 py-2"
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    border: '1px solid transparent' // Prevent layout shift
                }}
            >
                {displayValue}
            </div>
        );
    }

    // Edit mode and editable: show select dropdown with explicit border
    return (
        <select
            className="form-select form-select-sm px-3 py-2"
            value={value || ''}
            onChange={onChange}
            style={{
                ...styles.enabled,
                border: '1px solid var(--bs-border-color)'
            }}
        >
            {options?.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};
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
            return (
                <td className="px-3 py-2" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row[header.field] || <span className="text-muted">—</span>}
                </td>
            );
    }
};


export const Row = ({ row, headers, tableModel, actionColumnWidth }) => {

    const handleSave = async () => {
        await tableModel.saveRow(row);
    };

    const handleCancel = () => {
        if (row.isNew) {
            tableModel.deleteRow(row.id);
        } else {
            tableModel.toggleEditMode(row.id);
        }
    };

    const handleDelete = async () => {
        const name = row.name || `Row ${row.id}`;
        if (window.confirm(`Delete "${name}"?`)) {
            await tableModel.deleteRow(row.id);
        }
    };

    return (
        <tr className="align-middle">
            {headers.map((header) => (
                <Cell key={`${row.id}-${header.field}`} row={row} header={header} table={tableModel} />
            ))}
            <td style={{ width: actionColumnWidth, whiteSpace: "nowrap" }}>
                {row.isEditing ? (
                    <>
                        <i
                            className="fas fa-check me-3"
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
                        {tableModel.customActions
                            .filter((action) => action.isEditAction)
                            .map((action, index) => (
                                <i
                                    key={`edit-action-${index}`}
                                    className={`${action.icon} me-3`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => action.onClick(row, tableModel)}
                                    title={action.title}
                                />
                            ))}
                    </>
                ) : (
                    <>
                        {tableModel.customActions
                            .filter((action) => !action.isEditAction)
                            .map((action, index) => (
                                <i
                                    key={`action-${index}`}
                                    className={`${action.icon} me-3`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => action.onClick(row, tableModel)}
                                    title={action.title}
                                />
                            ))}

                        <i
                            className="fas fa-edit me-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => tableModel.toggleEditMode(row.id)}
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
export const Table = ({ tableModel, title, actionColumnWidth = 120 }) => {
    const { page, limit, total, lastPage } = tableModel.pagination;

    const hasEditingRow = tableModel.tableData.some((row) => row.isEditing);
    const editingRow = tableModel.tableData.find((row) => row.isEditing);

    const handleAddNewRow = () => {
        if (tableModel.loading) {
            ToastManager.addToast("Table is still loading. Please wait.", "warning");
            return;
        }

        const editingExists = tableModel.tableData.some((row) => row.isEditing);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit first.", "warning");
            return;
        }

        tableModel.addNewRow();
    };

    useEffect(() => {
        if (!hasEditingRow) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                const modalOpen = document.querySelector('.modal.show');
                if (modalOpen) return;
                if (editingRow) {
                    tableModel.toggleEditMode(editingRow.id);
                    ToastManager.addToast("Edit cancelled.", "info");
                }
            } else if (e.key === 'Enter') {
                if (editingRow) {
                    tableModel.saveRow(editingRow);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [hasEditingRow, editingRow, tableModel]);

    return (
        <div className="mt-4 card">
            {title && (
                <div className="card-header">
                    <h4>{title}</h4>
                </div>
            )}

            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0" style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                {tableModel.headers.map((header, index) => {
                                    const isSortable = header.sortable !== false; // default to true unless explicitly false
                                    const sortIcon = () => {
                                        if (!tableModel.sort || tableModel.sort.field !== header.field) {
                                            return null;
                                        }
                                        return tableModel.sort.order === 'asc' ? ' ▲' : ' ▼';
                                    };

                                    return (
                                        <th
                                            key={index}
                                            style={{ cursor: isSortable ? "pointer" : "default", position: "relative" }}
                                            onClick={() => isSortable && tableModel.setSortField(header.field)}
                                            title={isSortable ? `Sort by ${header.name}` : ""}
                                        >
                                            <span>{header.name}</span>
                                            <span style={{ fontSize: "0.8em", color: "var(--bs-secondary-color)" }}>
                                                {sortIcon()}
                                            </span>
                                        </th>
                                    );
                                })}
                                <th style={{ width: actionColumnWidth }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableModel.tableData.length === 0 && !tableModel.loading ? (
                                <tr>
                                    <td colSpan={tableModel.headers.length + 1} className="text-center text-muted py-4">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                tableModel.tableData.map((row) => (
                                    <Row
                                        key={row.id}
                                        row={row}
                                        headers={tableModel.headers}
                                        tableModel={tableModel}
                                        actionColumnWidth={actionColumnWidth}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>

                    {tableModel.loading && (
                        <div className="text-center my-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                        <nav aria-label="Table pagination">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link border"
                                        style={{ backgroundColor: 'var(--bs-secondary-bg, #e9ecef)' }}
                                        onClick={() => tableModel.goToPage(page - 1)}
                                        disabled={page === 1 || tableModel.loading}
                                    >
                                        Previous
                                    </button>
                                </li>

                                {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
                                    let pageNum;
                                    if (lastPage <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= lastPage - 2) {
                                        pageNum = lastPage - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return pageNum;
                                }).map((number) => (
                                    <li key={number} className={`page-item ${page === number ? 'active' : ''}`}>
                                        <button
                                            className={`page-link border ${page === number
                                                ? 'bg-secondary text-white'
                                                : 'text-body bg-transparent'
                                                }`}
                                            style={{
                                                backgroundColor: page === number
                                                    ? 'var(--bs-secondary)'
                                                    : 'var(--bs-secondary-bg, #e9ecef)',
                                            }}
                                            onClick={() => tableModel.goToPage(number)}
                                            disabled={tableModel.loading}
                                        >
                                            {number}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${page === lastPage ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link border"
                                        style={{ backgroundColor: 'var(--bs-secondary-bg, #e9ecef)' }}
                                        onClick={() => tableModel.goToPage(page + 1)}
                                        disabled={page === lastPage || tableModel.loading}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>

                        <div className="d-flex align-items-center gap-1">
                            <label htmlFor="page-limit" className="mb-0 text-nowrap">
                                Show:
                            </label>
                            <select
                                id="page-limit"
                                className="form-select form-select"
                                value={limit}
                                onChange={(e) => tableModel.setLimit(Number(e.target.value))}
                                disabled={tableModel.loading}
                                style={{ width: "auto", minWidth: "80px" }}
                            >
                                {[10, 25, 50, 100].map((val) => (
                                    <option key={val} value={val}>
                                        {val}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        <button
                            className="btn btn-outline-secondary "
                            onClick={handleAddNewRow}
                            disabled={tableModel.loading}
                            title="Add new item"
                        >
                            <i className="fas fa-plus"></i> Add
                        </button>

                        {tableModel.customButtons.map((btn, index) => (
                            <button
                                key={`table-btn-${index}`}
                                className={`btn ${btn.variant || 'btn-outline-secondary'}`}
                                onClick={() => btn.onClick(tableModel)}
                                title={btn.title}
                                disabled={btn.disabled || tableModel.loading}
                                style={{ whiteSpace: 'nowrap', ...btn.style }}
                            >
                                <i className={`${btn.icon} me-1`}></i>
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Optional: Entry info below the controls */}
                <div className="text-muted small mt-2 text-center">
                    {tableModel.loading
                        ? "Loading..."
                        : `Showing ${tableModel.tableData.length > 0 ? (page - 1) * limit + 1 : 0}
                           to ${(page - 1) * limit + tableModel.tableData.length} of ${total} entries`}
                </div>
            </div>
        </div>
    );
};