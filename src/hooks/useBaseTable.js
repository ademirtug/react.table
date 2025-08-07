// hooks/useBaseTable.js
import { useState, useEffect } from "react";
import ToastManager from '../utils/toastManager';

export function useBaseTable({
    initialData = [],
    onAddRow = null,
    onUpdateRow = null,
    onDeleteRow = null,
    customActions = []
}) {
    const [tableData, setTableData] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [originalValues, setOriginalValues] = useState({});

    // Initialize data and assign IDs
    useEffect(() => {
        let maxId = 0;
        const transformedData = initialData.map(row => {
            if (!row.id) {
                row.id = ++maxId;
            } else {
                maxId = Math.max(maxId, row.id);
            }
            return { ...row, isEditing: false };
        });
        setTableData(transformedData);
        setNextId(maxId + 1);
    }, [initialData]);

    // Add a new empty row
    const addNewRow = (headers) => {
        if (!Array.isArray(headers)) {
            ToastManager.addToast("Headers must be an array", "danger");
            console.error("Expected headers array, got:", headers);
            return false;
        }

        const editingExists = tableData.some(row => row.isEditing);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current row before adding a new one.", "warning");
            return false;
        }

        const newRow = { id: nextId, isEditing: true, isNew: true };
        headers.forEach(header => {
            if (!header.field) {
                console.warn("Header missing 'field':", header);
                return;
            }
            newRow[header.field] = header.type === "checkbox" ? false
                : header.type === "select" ? (header.options?.[0] || "") : "";
        });

        setTableData(prev => [...prev, newRow]);
        setNextId(prev => prev + 1);
        return true;
    };

    // Toggle edit mode with conflict check
    const toggleEditMode = (id) => {
        const editingExists = tableData.some(row => row.isEditing && row.id !== id);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit before editing another row.", "warning");
            return;
        }

        setTableData(prev => prev.map(row => {
            if (row.id === id) {
                // Entering edit mode: save original
                if (!row.isEditing) {
                    setOriginalValues(prevValues => ({
                        ...prevValues,
                        [id]: { ...row }
                    }));
                }
                // Canceling edit: restore original
                else if (originalValues[id]) {
                    return { ...originalValues[id], isEditing: false };
                }
                return { ...row, isEditing: !row.isEditing };
            }
            return { ...row, isEditing: false };
        }));
    };

    // Handle input change
    const handleChange = (id, field, value) => {
        setTableData(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // Save new row
    const addRow = async (row) => {
        if (!onAddRow) {
            ToastManager.addToast("Add functionality not configured.", "danger");
            return { ok: false };
        }

        const { isNew, isEditing, ...dataToSave } = row;
        const response = await onAddRow(dataToSave);

        if (response.ok) {
            setTableData(prev =>
                prev.map(r =>
                    r.id === row.id
                        ? { ...dataToSave, id: response.id || row.id, isEditing: false }
                        : r
                )
            );
        }

        return response;
    };

    // Update existing row
    const updateExistingRow = async (row) => {
        if (!onUpdateRow) {
            ToastManager.addToast("Update functionality not configured.", "danger");
            return { ok: false };
        }

        const { isNew, isEditing, ...dataToSave } = row;
        const response = await onUpdateRow(dataToSave);

        if (response.ok) {
            setTableData(prev =>
                prev.map(r =>
                    r.id === row.id
                        ? { ...dataToSave, isEditing: false }
                        : r
                )
            );
        }

        return response;
    };

    // Main save function
    const updateRow = async (row) => {
        return row.isNew ? await addRow(row) : await updateExistingRow(row);
    };

    // Delete row
    const deleteRow = async (id) => {
        if (typeof onDeleteRow === "function") {
            const result = await onDeleteRow(id);
            if (!result.ok) {
                ToastManager.addToast(result.message || "Failed to delete from storage", "danger");
                return result;
            }
        }

        setTableData(prev => prev.filter(row => row.id !== id));
        return { ok: true };
    };

    // Return all values and functions
    return {
        tableData,
        toggleEditMode,
        handleChange,
        updateRow,
        deleteRow,
        addNewRow,
        customActions
    };
}