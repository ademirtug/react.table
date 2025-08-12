// hooks/useBaseTable.js
import { useState, useEffect } from "react";
import ToastManager from "../utils/toastManager";

export function useBaseTable({
    headers = [],
    customActions = [],
    customButtons = [],
    fetchDataFn,
    addRowFn,
    updateRowFn,
    deleteRowFn,
    extraMethods = {},
    autoFetch = true
}) {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        lastPage: 1
    });
    const [nextId, setNextId] = useState(1);

    const [sort, setSort] = useState({
        field: null,
        order: null // 'asc' | 'desc' | null
    });

    useEffect(() => {
        if (autoFetch && fetchDataFn) {
            fetchData(1, pagination.limit);
        }
    }, []);

    /** Fetch & Pagination **/
    const fetchData = async (
        page = pagination.page,
        limit = pagination.limit,
        sortField = sort.field,
        sortOrder = sort.order
    ) => {
        if (!fetchDataFn) return;
        setLoading(true);
        try {
            const { page: p, limit: l, total, lastPage, items } =
                await fetchDataFn(page, limit, sortField, sortOrder);
            setPagination({ page: p, limit: l, total, lastPage });
            setTableData(items);
        } catch (error) {
            console.error("Fetch error:", error);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    const goToPage = (page) => {
        const validPage = Math.max(1, Math.min(page, pagination.lastPage));
        fetchData(validPage, pagination.limit);
    };

    const setLimit = (newLimit) => {
        const validLimits = [10, 25, 50, 100];
        const safeLimit = validLimits.includes(newLimit) ? newLimit : 10;
        const newLastPage = Math.max(1, Math.ceil(pagination.total / safeLimit));
        const targetPage = Math.min(pagination.page, newLastPage);
        fetchData(targetPage, safeLimit);
    };

    /** Row Operations **/
    const addNewRow = () => {
        const editingExists = tableData.some(row => row.isEditing);
        if (editingExists) {
            ToastManager.addToast("Please save or cancel the current edit before adding a new one.", "warning");
            return false;
        }
        const newRow = { id: nextId, isEditing: true, isNew: true };
        headers.forEach(header => {
            if (!header.field) return;
            newRow[header.field] =
                header.type === "checkbox"
                    ? false
                    : header.type === "select" && header.options?.length
                        ? header.options[0]
                        : "";
        });
        setTableData(prev => [...prev, newRow]);
        setNextId(prev => prev + 1);
        return true;
    };

    const handleChange = (id, field, value) => {
        setTableData(prev =>
            prev.map(row => row.id === id ? { ...row, [field]: value } : row)
        );
    };

    const saveRow = async (row) => {
        const fn = row.isNew ? addRowFn : updateRowFn;
        if (!fn) return { ok: false, message: "No handler provided" };

        const response = await fn(row);
        if (response.ok) {
            fetchData();
        }
        return response;
    };

    const deleteRow = async (id) => {
        if (!deleteRowFn) return { ok: false, message: "No handler provided" };
        const response = await deleteRowFn(id);
        if (response.ok) {
            fetchData();
        }
        return response;
    };

    const setSortField = (field) => {
        setSort(prev => {
            let newOrder = 'asc';
            if (prev.field === field) {
                if (prev.order === 'asc') newOrder = 'desc';
                else if (prev.order === 'desc') newOrder = null;
                else newOrder = 'asc';
            }

            // If order becomes null, don't refetch (no sort)
            if (newOrder === null) {
                fetchData(pagination.page, pagination.limit, null, null);
                return { field: null, order: null };
            }

            fetchData(pagination.page, pagination.limit, field, newOrder);
            return { field, order: newOrder };
        });
    };

    const toggleEditMode = (id) => {
        setTableData(prev =>
            prev.map(row => ({
                ...row,
                isEditing: row.id === id ? !row.isEditing : false
            }))
        );
    };

    return {
        tableData,
        loading,
        pagination,
        headers,
        customActions,
        customButtons,
        setTableData,
        fetchData,
        goToPage,
        setLimit,
        addNewRow,
        handleChange,
        saveRow,
        deleteRow,
        setSortField,
        sort,
        toggleEditMode,
        ...(extraMethods || {}),
    };
}
