// App.jsx
import React, { useMemo } from "react";
import { Table } from "./components/Table";
import { useLocalTable } from "./hooks/useLocalTable"; // Your new hook

// Generate sample data
const generateSampleData = () => {
    const statusOptions = ["In Progress", "Completed", "Pending"];
    const sampleData = [];

    for (let i = 1; i <= 50; i++) {
        sampleData.push({
            id: i,
            name: `Item ${i}`,
            is_active: Math.random() > 0.5,
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        });
    }

    return sampleData;
};

// Define your table headers
const tableHeaders = [
    { field: "name", name: "Name", type: "text", readOnly: true },
    { field: "is_active", name: "Active", type: "checkbox" },
    { field: "status", name: "Status", type: "select", options: ["In Progress", "Completed", "Pending"] },
];

function App() {
    // Generate sample data only once
    const initialData = useMemo(() => generateSampleData(), []);

    const myCustomActions = useMemo(() => [
        {
            icon: "fa-solid fa-upload",
            title: "Refresh",
            isEditAction: true,
            onClick: (row, tableHelpers) => {
                if (window.confirm("Are you sure you want to refresh this row?")) {
                    alert(`Refreshed ${row.name}`);
                }
            },
        },
    ], []);

    // Define custom table-level buttons
    const tableButtons = useMemo(
        () => [
            {
                label: "Export",
                icon: "fas fa-download",
                title: "Export data as JSON",
                onClick: (table) => {
                    const dataStr = JSON.stringify(table.tableData, null, 2);
                    const blob = new Blob([dataStr], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "table-data.json";
                    a.click();
                    URL.revokeObjectURL(url);
                    ToastManager.addToast("Exported successfully!", "success");
                },
            },
            {
                label: "Delete All",
                icon: "fas fa-trash",
                variant: "btn-outline-danger btn-outline-secondary",
                title: "Delete all rows",
                onClick: (table) => {
                    if (
                        window.confirm(
                            "Are you sure you want to delete ALL rows? This cannot be undone."
                        )
                    ) {
                        table.deleteAllRows(); // you'd need to implement this in useLocalTable
                        ToastManager.addToast("All rows deleted.", "warning");
                    }
                },
            },
        ],
        []
    );

    const table = useLocalTable({
        localStorageKey: "my-custom-table-data",
        initialData,
        customActions: myCustomActions,
        customButtons: tableButtons
    });

    return (
        <div className="container mt-5">
            <h1 className="mb-4">My Smart Table</h1>
            <Table table={table} headers={tableHeaders}/>
        </div>
    );
}

export default App;