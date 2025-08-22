// hooks/useBackendTable.js
import { useBaseTable } from "./useBaseTable";
import ToastManager from '../utils/toastManager';

export function useBackendTable({ apiUrl, headers = [], customRowActions = [], customTableActions = [] }) {
    const fetchDataFn = async (page, limit, sortFields, sortOrders) => {
        let url = `${apiUrl}/all?page=${page}&limit=${limit}`;

        // Handle multiple sort fields
        if (sortFields && sortFields.length > 0) {
            sortFields.forEach((field, index) => {
                const order = sortOrders && index < sortOrders.length ? sortOrders[index] : 'asc';
                url += `&sortFields=${field}&sortOrders=${order}`;
            });
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load data");
        return await res.json();
    };

    const addRowFn = async (row) => {
        try {
            const formData = new FormData();

            // Add all non-file fields
            headers.forEach(h => {
                if (row[h.field] !== undefined && h.field !== 'fileUpload') {
                    formData.append(h.field, row[h.field]);
                }
            });

            // Handle file upload
            if (row.fileUpload instanceof File) {
                formData.append('file', row.fileUpload); // backend expects 'file'
            }

            const response = await fetch(`${apiUrl}/add`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                return { ok: false, message: text };
            }

            const result = await response.json();
            return {
                ok: true,
                id: result.id,
                row: { ...result }
            };
        } catch (error) {
            console.error("Add error:", error);
            return { ok: false, message: error.message };
        }
    };

    const updateRowFn = async (row) => {
        const formData = new FormData();

        // Add all non-readOnly fields
        headers.forEach(h => {
            if (!h.readOnly && row[h.field] !== undefined) {
                // Skip file field here if it's handled separately
                if (h.field !== 'fileUpload') {
                    formData.append(h.field, row[h.field]);
                }
            }
        });


        if (row.fileUpload instanceof File) {
            formData.append('file', row.fileUpload);
        }

        try {
            const res = await fetch(`${apiUrl}/update/${row.id}`, {
                method: "PUT",
                body: formData
            });

            if (!res.ok) {
                const text = await res.text();
                return { ok: false, message: text };
            }

            return { ok: true };
        } catch (error) {
            console.error("Update error:", error);
            return { ok: false, message: error.message };
        }
    };

    const deleteRowFn = async (id) => {
        const res = await fetch(`${apiUrl}/delete/${id}`, { method: "DELETE" });
        if (!res.ok) return { ok: false, message: "Delete failed" };
        return { ok: true };
    };

    const downloadFile = async (href, { baseUrl = apiUrl } = {}) => {
        try {
            const finalUrl = `${baseUrl}${href}`;
            const a = document.createElement("a");
            a.href = finalUrl;
            a.download = ""; // Let server decide filename
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            ToastManager.addToast("Failed to trigger download", "error");
        }
    };

    const sync = async (row, { baseUrl = apiUrl } = {}) => {
        const res = await fetch(`${baseUrl}/sync/${row.id}`, { method: "GET" });
        if (!res.ok) {
            const text = await res.text();
            ToastManager.addToast(`Sync failed: ${text}`, "error");
        }
    };

    const syncAll = async ({ baseUrl = apiUrl } = {}) => {
        const res = await fetch(`${baseUrl}/syncall`, { method: "GET" });
        if (!res.ok) {
            const text = await res.text();
            ToastManager.addToast(`Sync failed: ${text}`, "error");
        }
    };

    const transferFile = async (row, { baseUrl = apiUrl } = {}) => {
        try {
            const response = await fetch(`${baseUrl}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(row.languageCode)
            });

            if (!response.ok) {
                const text = await response.text();
                ToastManager.addToast(`Transfer failed for ${row.languageCode}: ${text}`, "error");
                return { ok: false, message: text };
            }

            const result = await response.json();
            ToastManager.addToast(`Transfer successful for ${row.languageCode}`, "success");
            return {
                ok: true,
                result
            };
        } catch (error) {
            console.error("Transfer error:", error);
            ToastManager.addToast(`Transfer failed for ${row.languageCode}: ${error.message}`, "error");
            return { ok: false, message: error.message };
        }
    };

    const transferAll = async ({ baseUrl = apiUrl } = {}) => {
        try {
            const response = await fetch(`${baseUrl}/transferall`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const text = await response.text();
                ToastManager.addToast(`Transfer all failed: ${text}`, "error");
                return { ok: false, message: text };
            }

            const result = await response.json();

            // Display summary of transfer results
            if (result.successful === result.total) {
                ToastManager.addToast(`All ${result.total} dictionaries transferred successfully`, "success");
            } else {
                ToastManager.addToast(
                    `Transfer completed: ${result.successful} successful, ${result.failed} failed out of ${result.total} dictionaries`,
                    result.failed > 0 ? "warning" : "success"
                );
            }

            return {
                ok: true,
                result
            };
        } catch (error) {
            console.error("Transfer all error:", error);
            ToastManager.addToast(`Transfer all failed: ${error.message}`, "error");
            return { ok: false, message: error.message };
        }
    };

    return useBaseTable({
        headers,
        customRowActions,
        customTableActions,
        fetchDataFn,
        addRowFn,
        updateRowFn,
        deleteRowFn,
        downloadFile,
        extraMethods: {
            downloadFile,
            transferFile,
            transferAll, // Add transferAll to extraMethods
            sync,
            syncAll
        },
    });
}
