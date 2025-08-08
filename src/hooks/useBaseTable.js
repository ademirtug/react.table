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

    const addNewRow = (headers) => {
        if (!Array.isArray(headers)) {
            ToastManager.addToast("Headers must be an array", "danger");
            return false;
        }

        const editingExists = tableData.some(row => row.isEditing);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit before adding a new one.", "warning");
            return false;
        }

        const newRow = { id: nextId, isEditing: true, isNew: true };
        headers.forEach(header => {
            if (!header.field) return;
            newRow[header.field] = header.type === "checkbox"
                ? false
                : header.type === "select" && header.options?.length
                    ? header.options[0]
                    : "";
        });

        setTableData(prev => [...prev, newRow]);
        setNextId(prev => prev + 1);
        return true;
    };

    const toggleEditMode = (id) => {
        const editingExists = tableData.some(row => row.isEditing && row.id !== id);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit before editing another row.", "warning");
            return;
        }

        setTableData(prev => prev.map(row => {
            if (row.id === id) {
                if (!row.isEditing) {
                    setOriginalValues(prevValues => ({
                        ...prevValues,
                        [id]: { ...row }
                    }));
                } else if (originalValues[id]) {
                    return { ...originalValues[id], isEditing: false };
                }
                return { ...row, isEditing: !row.isEditing };
            }
            return { ...row, isEditing: false };
        }));
    };

    const handleChange = (id, field, value) => {
        setTableData(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

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

    const updateRow = async (row) => {
        return row.isNew ? await addRow(row) : await updateExistingRow(row);
    };

    // ✅ Fixed: Only call backend delete for existing rows
    const deleteRow = async (id) => {
        const row = tableData.find(r => r.id === id);
        if (!row) return { ok: true };

        if (row.isNew) {
            // Just remove locally — never saved to backend
            setTableData(prev => prev.filter(r => r.id !== id));
            return { ok: true };
        }

        if (typeof onDeleteRow === "function") {
            const result = await onDeleteRow(id);
            if (!result.ok) {
                ToastManager.addToast(result.message || "Failed to delete", "danger");
                return result;
            }
        }

        setTableData(prev => prev.filter(r => r.id !== id));
        return { ok: true };
    };

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