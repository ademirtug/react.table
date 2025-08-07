# @selestra11/react.table

A fully customizable, editable, and paginated data table component for React — powered by Bootstrap and Font Awesome. Includes support for local and remote data sources via simple hook implementations.

---

## ✨ Features

- Add, edit, delete, and paginate rows
- Use checkboxes, selects, and text inputs
- Toast notifications for actions
- Persist data with custom or built-in hooks (e.g., localStorage)
- Bootstrap + Font Awesome compatible

---

## 📦 Installation

```bash
npm install @selestra11/react.table
```

---

## 🔧 Peer Dependencies

Make sure you include these in your project:

```bash
npm install bootstrap @fortawesome/fontawesome-free
```

In your main `index.js` or `App.js`:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
```

---

## 🚀 Quick Start

### 1. Define headers

```js
const headers = [
  { name: "Name", field: "name", type: "text" },
  { name: "Age", field: "age", type: "text" },
  { name: "Is Active", field: "isActive", type: "checkbox" },
  { name: "Role", field: "role", type: "select", options: ["Admin", "User", "Guest"] },
];
```

### 2. Use a hook (local or custom)

```js
import { useLocalTable } from '@selestra11/react.table';

const table = useLocalTable({
  localStorageKey: "my-table",
  initialData: [
    { name: "Alice", age: "25", isActive: true, role: "Admin" },
    { name: "Bob", age: "30", isActive: false, role: "User" },
  ],
});
```

### 3. Render the table

```js
import { Table } from '@selestra11/react.table';

<Table headers={headers} table={table} />;
```

---

## 🛠️ API

### 🔹 `headers`

Each column in the table is defined by a header object:

| Field   | Type       | Required | Description |
|---------|------------|----------|-------------|
| name    | `string`   | ✅        | Display name |
| field   | `string`   | ✅        | Field name in row data |
| type    | `string`   | ✅        | One of: `"text"`, `"checkbox"`, `"select"` |
| options | `string[]` | ❌       | Required if `type === "select"` |

---

### 🔹 `useLocalTable(options)`

A hook that saves data in `localStorage`.

```js
useLocalTable({
  localStorageKey: "key",     // unique key to store in localStorage
  initialData: [...],         // initial rows
  customActions: [            // optional custom icons
    {
      icon: "fas fa-eye",
      title: "Preview",
      onClick: (row, table) => alert(JSON.stringify(row, null, 2)),
    },
  ],
});
```

---

## 🧩 Custom Hooks (Advanced)

You can create your own hook by reusing the built-in logic:

```js
import { useBaseTable } from '@selestra11/react.table';

export function useRemoteTable() {
  return useBaseTable({
    initialData: [],
    onAddRow: async (row) => { ... },
    onUpdateRow: async (row) => { ... },
    onDeleteRow: async (id) => { ... },
    customActions: [...]
  });
}
```

---

## 🔔 Toast Notifications

This package uses a built-in `ToastManager` that you can customize. It shows `success`, `danger`, or `warning` messages for table operations.

---

## 📦 Components

### `<Table headers={headers} table={table} />`

Renders the full table with editable fields, buttons, pagination, and actions.

---

## 🧪 Example Integration

```js
import React from 'react';
import { Table, useLocalTable } from '@selestra11/react.table';

const headers = [
  { name: "Full Name", field: "name", type: "text" },
  { name: "Subscribed", field: "subscribed", type: "checkbox" },
  { name: "Plan", field: "plan", type: "select", options: ["Free", "Pro", "Enterprise"] },
];

const initialData = [
  { name: "John Doe", subscribed: true, plan: "Pro" },
  { name: "Jane Smith", subscribed: false, plan: "Free" },
];

export default function App() {
  const table = useLocalTable({
    localStorageKey: "subscription-users",
    initialData,
  });

  return <Table headers={headers} table={table} />;
}
```

---

## 🧑‍💻 License

MIT © [Selestra](https://github.com/selestra11)