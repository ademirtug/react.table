// hooks/useBaseTable.js
import { useState, useEffect } from "react";
import ToastManager from "../utils/toastManager";

export function useBaseTable({
    headers = [],
    customRowActions = [],
    customTableActions = [],
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

    // Multi-column sort state - array of {field, order}
    const [sort, setSort] = useState(() => {
        // Initialize with default sorts from headers
        const defaultSorts = headers
            .filter(header => header.defaultSort)
            .map(header => ({
                field: header.field,
                order: typeof header.defaultSort === 'string'
                    ? header.defaultSort
                    : 'asc'
            }));
        return defaultSorts;
    });

    useEffect(() => {
        if (autoFetch && fetchDataFn) {
            fetchData(1, pagination.limit, sort);
        }
    }, []);

    /** Fetch & Pagination **/
    const fetchData = async (
        page = pagination.page,
        limit = pagination.limit,
        sortCriteria = sort
    ) => {
        if (!fetchDataFn) return;
        setLoading(true);
        try {
            // Extract fields and orders from sort criteria
            const sortFields = sortCriteria.map(s => s.field);
            const sortOrders = sortCriteria.map(s => s.order);

            const { page: p, limit: l, total, lastPage, items } =
                await fetchDataFn(page, limit, sortFields, sortOrders);
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
        fetchData(validPage, pagination.limit, sort);
    };

    const setLimit = (newLimit) => {
        const validLimits = [10, 25, 50, 100];
        const safeLimit = validLimits.includes(newLimit) ? newLimit : 10;
        const newLastPage = Math.max(1, Math.ceil(pagination.total / safeLimit));
        const targetPage = Math.min(pagination.page, newLastPage);
        fetchData(targetPage, safeLimit, sort);
    };

    /** Multi-Column Sorting **/
    const setSortField = (field) => {
        setSort(prev => {
            const existingIndex = prev.findIndex(s => s.field === field);
            let newSorts;

            if (existingIndex >= 0) {
                // Column already has a sort - cycle through states
                const existingSort = prev[existingIndex];
                let newOrder;

                if (existingSort.order === 'asc') newOrder = 'desc';
                else if (existingSort.order === 'desc') newOrder = null;
                else newOrder = 'asc';

                if (newOrder === null) {
                    // Remove this sort
                    newSorts = prev.filter(s => s.field !== field);
                } else {
                    // Update this sort
                    newSorts = [...prev];
                    newSorts[existingIndex] = { field, order: newOrder };
                }
            } else {
                // New column sort - add as highest priority
                newSorts = [...prev, { field, order: 'asc' }]
            }

            // Filter out null sorts
            newSorts = newSorts.filter(s => s.order !== null);

            fetchData(pagination.page, pagination.limit, newSorts);
            return newSorts;
        });
    };

    const clearAllSorts = () => {
        const clearedSorts = [];
        fetchData(pagination.page, pagination.limit, clearedSorts);
        setSort(clearedSorts);
    };

    const getSortOrder = (field) => {
        const sortEntry = sort.find(s => s.field === field);
        return sortEntry ? sortEntry.order : null;
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
            fetchData(pagination.page, pagination.limit, sort); // Add sort parameter
        }
        return response;
    };

    const deleteRow = async (id) => {
        if (!deleteRowFn) return { ok: false, message: "No handler provided" };
        const response = await deleteRowFn(id);
        if (response.ok) {
            fetchData(pagination.page, pagination.limit, sort); // Add sort parameter
        }
        return response;
    };

    const toggleEditMode = (id) => {
        setTableData(prev => {
            const row = prev.find(r => r.id === id);
            if (!row) return prev;

            // If it's a new row and we're turning OFF edit mode (i.e., canceling)
            if (row.isNew && row.isEditing) {
                return prev.filter(r => r.id !== id);
            }

            // Otherwise: just toggle isEditing (and ensure only one row is editing)
            return prev.map(r => ({
                ...r,
                isEditing: r.id === id ? !r.isEditing : false
            }));
        });
    };

    return {
        tableData,
        loading,
        pagination,
        headers,
        customRowActions,
        customTableActions,
        setTableData,
        fetchData,
        goToPage,
        setLimit,
        addNewRow,
        handleChange,
        saveRow,
        deleteRow,
        setSortField,
        clearAllSorts,
        getSortOrder,
        sort,
        toggleEditMode,
        ...(extraMethods || {}),
    };
}