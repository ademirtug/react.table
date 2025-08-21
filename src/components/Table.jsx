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

const TextCell = ({ value, onChange, isEditing, id, isReadOnly, maxWidth }) => {
    const cellContentStyle = {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: '1px solid transparent',
        width: maxWidth || '100%', // Respect the passed width
        maxWidth: maxWidth || '100%',
        boxSizing: 'border-box'
    };

    if (!isEditing || isReadOnly) {
        return (
            <div
                className="px-3 py-2"
                style={cellContentStyle}
                title={value}
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
                border: '1px solid var(--bs-border-color)',
                width: maxWidth || '100%', // Respect the passed width
                maxWidth: maxWidth || '100%',
                boxSizing: 'border-box'
            }}
            className="form-control form-control-sm px-3 py-2"
        />
    );
};

const SelectCell = ({ value, options, onChange, isEditing, isReadOnly, maxWidth }) => {
    const displayValue = options?.includes(value) ? value : <span className="text-muted">—</span>;
    const cellContentStyle = {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: '1px solid transparent',
        width: maxWidth || '100%', // Respect the passed width
        maxWidth: maxWidth || '100%',
        boxSizing: 'border-box'
    };

    if (!isEditing || isReadOnly) {
        return (
            <div
                className="px-3 py-2"
                style={cellContentStyle}
            >
                {displayValue}
            </div>
        );
    }

    return (
        <select
            className="form-select form-select-sm px-3 py-2"
            value={value || ''}
            onChange={onChange}
            style={{
                ...styles.enabled,
                border: '1px solid var(--bs-border-color)',
                width: maxWidth || '100%', // Respect the passed width
                maxWidth: maxWidth || '100%',
                boxSizing: 'border-box'
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

const CheckboxCell = ({ value, onChange, isEditing, isReadOnly }) => {
    if (!isEditing || isReadOnly) {
        // View mode OR read-only: centered icon with border placeholder
        return (
            <div className="d-flex align-items-center justify-content-start px-3 py-2"
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
        <div className="d-flex align-items-center justify-content-start px-3 py-2"
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

export const Cell = ({ row, header, table }) => {
    const { handleChange } = table;
    const isReadOnly = !!header.readOnly;
    const isEditing = row.isEditing;

    const handleCellChange = (e) => {
        if (isReadOnly) return;
        const value = header.type === "checkbox" ? e.target.checked : e.target.value;
        handleChange(row.id, header.field, value);
    };

    // Common cell style that respects the header width
    const cellStyle = {
        maxWidth: header.width || "auto",
        width: header.width || "auto", // Add explicit width as well
        overflow: "hidden"
    };

    switch (header.type) {
        case "text":
            return (
                <td style={cellStyle}>
                    <TextCell
                        value={row[header.field]}
                        onChange={handleCellChange}
                        isEditing={isEditing}
                        id={row.id}
                        isReadOnly={isReadOnly}
                        width={header.width} // Pass width to TextCell
                    />
                </td>
            );

        case "checkbox":
            return (
                <td style={cellStyle}>
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
                <td style={cellStyle}>
                    <SelectCell
                        value={row[header.field]}
                        options={header.options}
                        onChange={handleCellChange}
                        isEditing={isEditing}
                        isReadOnly={isReadOnly}
                        width={header.width} // Pass width to SelectCell
                    />
                </td>
            );

        default:
            return (
                <td
                    className="px-3 py-2"
                    style={{
                        ...cellStyle,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis"
                    }}
                >
                    {row[header.field] || <span className="text-muted">—</span>}
                </td>
            );
    }
};


export const Row = ({ row, headers, tableModel }) => {
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
                <Cell
                    key={`${row.id}-${header.field}`}
                    row={row}
                    header={header}
                    table={tableModel}
                />
            ))}
            <td
                className="text-end"
                style={{
                    width: 'min-content',
                    whiteSpace: 'nowrap',
                    padding: '0.25rem 0.5rem',
                    position: 'relative', // 👈 Ensure relative for absolute children
                    overflow: 'visible'   // 👈 Prevent clipping
                }}
            >
                <div className="dropdown d-inline-block">
                    <button
                        className="btn btn-sm btn-outline-secondary border-0"
                        type="button"
                        id={`dropdownMenuButton-${row.id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                            padding: '0.25rem 0.5rem',
                            minWidth: 0
                        }}
                    >
                        <i className="fas fa-ellipsis" style={{ fontSize: '1.25rem' }}></i>
                    </button>
                    <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby={`dropdownMenuButton-${row.id}`}
                        data-bs-popper="none"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            zIndex: 1060,
                            overflow: 'auto',
                            maxHeight: '300px'
                        }}
                    >
                        {row.isEditing ? (
                            <>
                                <li>
                                    <button className="dropdown-item" onClick={handleSave}>
                                        <i className="fas fa-check me-2"></i> Save
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={handleCancel}>
                                        <i className="fas fa-times me-2"></i> Cancel
                                    </button>
                                </li>
                                {tableModel.customRowActions
                                    .filter((action) => action.isEditAction)
                                    .map((action, index) => (
                                        <li key={`edit-action-${index}`}>
                                            <button
                                                className="dropdown-item"
                                                onClick={() =>
                                                    action.onClick(row, tableModel)
                                                }
                                            >
                                                <i className={`${action.icon} me-2`}></i>
                                                {action.title}
                                            </button>
                                        </li>
                                    ))}
                            </>
                        ) : (
                            <>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() =>
                                            tableModel.toggleEditMode(row.id)
                                        }
                                    >
                                        <i className="fas fa-edit me-2"></i> Edit
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={handleDelete}
                                    >
                                        <i className="fas fa-trash me-2"></i> Delete
                                    </button>
                                </li>
                                {tableModel.customRowActions
                                    .filter((action) => !action.isEditAction)
                                    .map((action, index) => (
                                        <li key={`action-${index}`}>
                                            <button
                                                className="dropdown-item"
                                                onClick={() =>
                                                    action.onClick(row, tableModel)
                                                }
                                            >
                                                <i className={`${action.icon} me-2`}></i>
                                                {action.title}
                                            </button>
                                        </li>
                                    ))}
                            </>
                        )}
                    </ul>
                </div>
            </td>
        </tr>
    );
};


export const Table = ({ tableModel, title }) => {
    const { page, limit, total, lastPage } = tableModel.pagination;

    const hasEditingRow = tableModel.tableData.some((row) => row.isEditing);
    const editingRow = tableModel.tableData.find((row) => row.isEditing);

    const handleAddNewRow = () => {
        if (tableModel.loading) {
            ToastManager.addToast("Table is still loading. Please wait.", "warning");
            return;
        }
        if (hasEditingRow) {
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
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasEditingRow, editingRow, tableModel]);

    return (
        <div className="mt-4 card">
            {title && (
                <div className="card-header">
                    <h4>{title}</h4>
                </div>
            )}

            <div className="card-body">
                <div className="table-responsive" style={{ overflow: "visible" }}>
                    <table
                        className="table table-striped table-hover mb-0"
                        style={{
                            width: '100%',
                            tableLayout: 'fixed'
                        }}
                    >
                        <thead>
                            <tr>
                                {tableModel.headers.map((header, index) => {
                                    const isSortable = header.sortable !== false;
                                    const sortOrder = tableModel.getSortOrder(header.field);

                                    const sortIcon = () => {
                                        if (sortOrder === null) return null;
                                        return sortOrder === 'asc' ? ' ▲' : ' ▼';
                                    };

                                    return (
                                        <th
                                            key={index}
                                            className="px-3 py-2"
                                            style={{
                                                width: header.width || "auto",
                                                maxWidth: header.width || "auto",
                                                cursor: isSortable ? "pointer" : "default",
                                                position: "relative",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
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
                                <th
                                    className="px-3"
                                    style={{
                                        width: 'min-content',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'right'
                                    }}
                                >
                                    Action
                                </th>
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
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
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

                        {tableModel.customTableActions.map((btn, index) => (
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
