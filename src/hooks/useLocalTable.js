// hooks/useLocalTable.js
import { useBaseTable } from "./useBaseTable";

export function useLocalTable({
    localStorageKey,
    headers = [],
    customActions = [],
    customButtons = [],
    initialData = null,
    extraMethods = {}
}) {
    const getData = () => {
        try {
            const stored = localStorage.getItem(localStorageKey);
            if (!stored && initialData) {
                const dataToStore = Array.isArray(initialData)
                    ? initialData
                    : [];
                localStorage.setItem(localStorageKey, JSON.stringify(dataToStore));
                return dataToStore;
            }
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to read from localStorage:", error);
            return initialData || [];
        }
    };

    const saveData = (data) => {
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(data));
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    };

    /** Add deleteAllRows utility */
    const deleteAllRows = () => {
        saveData([]);
        // Refetch to update UI
        fetchDataFn(1, 10);
    };

    /** Fetch & Pagination with Sorting **/
    const fetchDataFn = async (page = 1, limit = 10, sortField = null, sortOrder = null) => {
        let items = getData();

        // Apply sorting
        if (sortField && sortOrder) {
            const direction = sortOrder === "asc" ? 1 : -1;
            items = [...items].sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];

                if (valA == null && valB == null) return 0;
                if (valA == null) return 1;
                if (valB == null) return -1;

                if (typeof valA === "string") {
                    return direction * valA.localeCompare(valB);
                }
                return direction * (valA - valB);
            });
        }

        const total = items.length;
        const start = (page - 1) * limit;
        const paginatedItems = items.slice(start, start + limit);

        return {
            page,
            limit,
            total,
            lastPage: Math.max(1, Math.ceil(total / limit)),
            items: paginatedItems
        };
    };

    const addRowFn = async (row) => {
        const current = getData();
        const newRow = { ...row };

        if (row.fileUpload instanceof File) {
            newRow.fileUpload = row.fileUpload.name;
        }

        const updated = [...current, newRow];
        saveData(updated);
        return { ok: true, id: row.id, row: newRow };
    };

    const updateRowFn = async (row) => {
        const current = getData();
        const index = current.findIndex(r => r.id === row.id);
        if (index === -1) return { ok: false, message: "Row not found" };

        const updatedRow = { ...row };
        if (row.fileUpload instanceof File) {
            updatedRow.fileUpload = row.fileUpload.name;
        }

        current[index] = updatedRow;
        saveData(current);
        return { ok: true };
    };

    const deleteRowFn = async (id) => {
        const current = getData();
        const filtered = current.filter(r => r.id !== id);
        saveData(filtered);
        return { ok: true };
    };

    // Utilities
    const downloadFile = async (filePath) => {
        try {
            const a = document.createElement("a");
            a.href = "#";
            a.download = "";
            a.textContent = `Download ${filePath}`;
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download simulation error:", error);
        }
    };

    const sync = async (row) => {
        console.log(`Syncing local row ${row.id}`);
    };

    const syncAll = async () => {
        console.log("Syncing all local rows");
    };

    const uploadFile = async (file) => {
        if (!(file instanceof File)) return { ok: false, message: "Invalid file" };
        return { ok: true, filename: file.name };
    };

    return useBaseTable({
        headers,
        customActions,
        customButtons,
        fetchDataFn,
        addRowFn,
        updateRowFn,
        deleteRowFn,
        extraMethods: {
            downloadFile,
            sync,
            syncAll,
            uploadFile,
            deleteAllRows, // 👈 now available in tableModel
            ...extraMethods
        }
    });
}