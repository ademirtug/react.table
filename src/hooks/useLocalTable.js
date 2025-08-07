// src/hooks/useLocalTable.js
import { useState, useEffect } from "react";
import { useBaseTable } from "./useBaseTable";

export function useLocalTable({
    localStorageKey,
    initialData = [],
    customActions = []
}) {
    const [loadedData, setLoadedData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load data from localStorage on mount
    useEffect(() => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(localStorageKey);
            const data = stored ? JSON.parse(stored) : [...initialData];
            setLoadedData(Array.isArray(data) ? data : []);

            // If no stored data, initialize localStorage
            if (!stored && initialData.length > 0) {
                localStorage.setItem(localStorageKey, JSON.stringify(initialData));
            }
        } catch (e) {
            console.error(`Failed to load data for key ${localStorageKey}`, e);
            setLoadedData([...initialData]);
        } finally {
            setLoading(false);
        }
    }, [localStorageKey, initialData]);

    // Persist and update
    const handleAddRow = async (newRow) => {
        try {
            const currentData = JSON.parse(localStorage.getItem(localStorageKey)) || [];
            const newData = [...currentData, newRow];
            localStorage.setItem(localStorageKey, JSON.stringify(newData));
            setLoadedData(newData);
            return { ok: true, id: newRow.id };
        } catch (error) {
            console.error("LocalStorage add error:", error);
            return { ok: false, message: "Add failed" };
        }
    };

    const handleUpdateRow = async (rowToUpdate) => {
        try {
            const currentData = JSON.parse(localStorage.getItem(localStorageKey)) || [];
            const existingIndex = currentData.findIndex(r => r.id === rowToUpdate.id);
            if (existingIndex === -1) return { ok: false, message: "Row not found" };

            const newData = [...currentData];
            newData[existingIndex] = rowToUpdate;
            localStorage.setItem(localStorageKey, JSON.stringify(newData));
            setLoadedData(newData);
            return { ok: true };
        } catch (error) {
            console.error("LocalStorage update error:", error);
            return { ok: false, message: "Update failed" };
        }
    };

    const handleDeleteRow = async (id) => {
        try {
            const currentData = JSON.parse(localStorage.getItem(localStorageKey)) || [];
            const newData = currentData.filter(row => row.id !== id);
            localStorage.setItem(localStorageKey, JSON.stringify(newData));
            setLoadedData(newData);
            return { ok: true };
        } catch (error) {
            console.error("LocalStorage delete error:", error);
            return { ok: false, message: "Delete failed" };
        }
    };

    // Only return the base table hook once loading is done
    const table = useBaseTable({
        initialData: loadedData,
        onAddRow: handleAddRow,
        onUpdateRow: handleUpdateRow,
        onDeleteRow: handleDeleteRow,
        customActions
    });

    return {
        ...table,
        loading,
        // Optionally expose reload
        reload: () => {
            const stored = localStorage.getItem(localStorageKey);
            const data = stored ? JSON.parse(stored) : [...initialData];
            setLoadedData(Array.isArray(data) ? data : []);
        }
    };
}