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
    { field: "name", name: "Name", type: "text" },
    { field: "is_active", name: "Active", type: "checkbox" },
    { field: "status", name: "Status", type: "select", options: ["In Progress", "Completed", "Pending"] },
];

function App() {
    // Generate sample data only once
    const initialData = useMemo(() => generateSampleData(), []);

    const myCustomActions = useMemo(() => [
        {
            icon: "fas fa-sync-alt text-info",
            title: "Refresh",
            onClick: (row, tableHelpers) => {
                if (window.confirm("Are you sure you want to refresh this row?")) {
                    alert(`Refreshed ${row.name}`);
                }
            },
        },
    ], []);

    const table = useLocalTable({
        localStorageKey: "my-custom-table-data",
        initialData,
        customActions: myCustomActions,
    });

    return (
        <div className="container mt-5">
            <h1 className="mb-4">My Smart Table</h1>
            <Table table={table} headers={tableHeaders} />
        </div>
    );
}

export default App;