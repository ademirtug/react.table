const ToastManager = {
    addToast(message, type = "info", delay = 5000) {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container position-fixed bottom-0 end-0 p-3";
            document.body.appendChild(container);
        }

        const toastElement = document.createElement("div");
        toastElement.className = `toast show text-bg-${type} border-0`;
        toastElement.role = "alert";
        toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close me-2 m-auto" aria-label="Close"></button>
      </div>
    `;

        const closeButton = toastElement.querySelector(".btn-close");
        closeButton.onclick = () => {
            toastElement.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        };

        container.appendChild(toastElement);

        setTimeout(() => {
            toastElement.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, delay);
    }
};

export default ToastManager;