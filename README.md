
---

### 💾 Download This README.md

To **download this as a file**, run this in your browser’s console (F12 → Console):

```js
(() => {
  const readme = `# Leximo Table 🪄

A customizable, feature-rich **React table component** with inline editing, persistence (localStorage or backend), and Bootstrap 5 support. Perfect for admin panels, dashboards, and data-heavy UIs.

✨ **Fully editable** | 💾 **Local & API storage** | 🧩 **Custom actions** | 📢 **Toast feedback**

---

## 🚀 Features

- ✅ **Inline Editing** – Click to edit text, checkboxes, and select fields
- ✅ **Add, Edit, Delete Rows** – Full CRUD support
- ✅ **Two Storage Options**:
  - \`LocalTableProvider\` – Uses \`localStorage\`
  - \`BackendTableProvider\` – Connects to REST API
- ✅ **Custom Row Actions** – Add buttons like "Star", "Clone", "Export"
- ✅ **Toast Notifications** – Built-in feedback for user actions
- ✅ **Bootstrap 5 Compatible** – Clean, responsive design
- ✅ **Font Awesome 6 (for icons)** – Edit, delete, custom actions
- ✅ **Extensible** – Extend \`BaseTableProvider\` for custom backends
- ✅ **Single Import** – All components and hooks from one package

---

## 📦 Installation

\`\`\`bash
npm install leximo-table
\`\`\`

---

## 🧰 Requirements

Include these in your \`index.html\` or layout:

\`\`\`html
<!-- Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Font Awesome 6 (for icons) -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
\`\`\`

> 💡 Tip: You can use your own CDN or local copies.

---

## 🚀 Quick Start

### 1. Using Local Storage (Simple)

\`\`\`jsx
import { Table, LocalTableProvider } from "leximo-table";

const headers = [
  { name: "Title", field: "title", type: "text" },
  { name: "Published", field: "published", type: "checkbox" },
  { name: "Category", field: "category", type: "select", options: ["News", "Blog", "Tutorial"] },
];

function App() {
  return (
    <LocalTableProvider localStorageKey="blog-posts">
      <Table headers={headers} />
    </LocalTableProvider>
  );
}
\`\`\`

### 2. Using Backend API (Advanced)

\`\`\`jsx
import { Table, BackendTableProvider } from "leximo-table";

const headers = [
  { name: "Name", field: "name", type: "text" },
  { name: "Active", field: "active", type: "checkbox" },
  { name: "Role", field: "role", type: "select", options: ["Admin", "User", "Guest"] },
];

function App() {
  return (
    <BackendTableProvider apiUrl="https://api.example.com/users">
      <Table headers={headers} />
    </BackendTableProvider>
  );
}
\`\`\`

---

## 🧩 Header Configuration

Each column is defined by a header object:

\`\`\`js
{
  name: "Display Name",       // Column header label
  field: "dataKey",           // Key in your data object
  type: "text" | "checkbox" | "select",
  options?: ["Option1", ...]  // Required only for 'select'
}
\`\`\`

Example:
\`\`\`js
const headers = [
  { name: "Product", field: "name", type: "text" },
  { name: "In Stock", field: "inStock", type: "checkbox" },
  { name: "Category", field: "category", type: "select", options: ["Electronics", "Books", "Clothing"] }
];
\`\`\`

---

## 🎯 Custom Actions

Add custom buttons to each row:

\`\`\`js
const customActions = [
  {
    icon: "fas fa-star text-warning",
    title: "Mark Important",
    onClick: (row, helpers) => {
      alert(\`Marked "\${row.name}" as important!\`);
    }
  },
  {
    icon: "fas fa-clone text-info",
    title: "Duplicate",
    onClick: (row, helpers) => {
      helpers.addNewRow({ ...row, id: Date.now(), name: \`Copy of \${row.name}\` });
    }
  }
];
\`\`\`

Use it with your provider:

\`\`\`jsx
<LocalTableProvider localStorageKey="items" customActions={customActions}>
  <Table headers={headers} />
</LocalTableProvider>
\`\`\`

> \`helpers\` includes: \`addNewRow\`, \`updateRow\`, \`deleteRow\`, etc.

---

## 🔔 Toast Notifications

Built-in toast messages for:
- Row added
- Row updated
- Row deleted
- Errors (e.g., edit conflict)

Uses \`ToastManager\` — no setup needed!

Example message:
> "Please save or cancel the current row before adding a new one." ⚠️

---

## 🔧 Advanced: Extend BaseTableProvider

Create your own storage logic:

\`\`\`js
import { BaseTableProvider } from "leximo-table";

function CustomTableProvider({ children, syncUrl }) {
  const handleAddRow = async (row) => {
    const res = await fetch(syncUrl, { method: "POST", body: JSON.stringify(row) });
    return res.ok ? { ok: true, id: await res.json().id } : { ok: false };
  };

  return (
    <BaseTableProvider
      initialData={[]}
      onAddRow={handleAddRow}
      onUpdateRow={/*...*/}
      onDeleteRow={/*...*/}
    >
      {children}
    </BaseTableProvider>
  );
}
\`\`\`

---

## 🎨 Styling & Design

- Uses **Bootstrap 5** classes for layout and responsiveness
- Supports dark mode via Bootstrap
- Icons from **Font Awesome 6**
- Inline inputs styled to match native form controls

> No additional CSS required!

---

## ⚠️ Notes & Best Practices

- Only **one row can be edited at a time** – enforced by the component
- Use \`useMemo\` for \`headers\` and \`customActions\` to prevent unnecessary re-renders
- For backend mode, ensure your API returns \`{ ok: true, id?: newId }\` on POST
- Clear localStorage with \`localStorage.removeItem("your-key")\` during dev

---

## 📦 Exports

All features available from one import:

\`\`\`js
import {
  Table,
  useTable,
  BaseTableProvider,
  LocalTableProvider,
  BackendTableProvider
} from "leximo-table";
\`\`\`

---

## 🤝 Contributing

Open to improvements! Feel free to:
- Report bugs
- Suggest features
- Submit PRs for new cell types (e.g., date, number)
- Add support for pagination, sorting, filtering

---

## 📄 License

MIT – Free for personal and commercial use.
`;

  const blob = new Blob([readme], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'README.md';
  a.click();
  URL.revokeObjectURL(url);
})();