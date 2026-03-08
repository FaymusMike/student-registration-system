// Modals Component - Reusable Modal System

const Modals = (function() {
    // Confirmation Modal
    function showConfirmModal(options) {
        const {
            title = 'Confirm Action',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm,
            onCancel,
            type = 'primary' // primary, danger, warning, success
        } = options;

        const modalId = 'confirmModal-' + Date.now();
        
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                            <button type="button" class="btn btn-${type}" id="confirmBtn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        
        document.getElementById('confirmBtn').addEventListener('click', () => {
            modal.hide();
            if (onConfirm) onConfirm();
        });
        
        modal.show();
        
        // Clean up after hidden
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
            if (onCancel) onCancel();
        });
    }

    // Alert Modal
    function showAlertModal(options) {
        const {
            title = 'Alert',
            message = '',
            type = 'info', // info, success, warning, danger
            buttonText = 'OK'
        } = options;

        const modalId = 'alertModal-' + Date.now();
        
        const iconClass = {
            info: 'fa-info-circle text-primary',
            success: 'fa-check-circle text-success',
            warning: 'fa-exclamation-triangle text-warning',
            danger: 'fa-exclamation-circle text-danger'
        }[type];

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas ${iconClass} me-2"></i>${title}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-${type}" data-bs-dismiss="modal">${buttonText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Clean up after hidden
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });
    }

    // Prompt Modal
    function showPromptModal(options) {
        const {
            title = 'Enter Information',
            message = '',
            inputType = 'text',
            placeholder = '',
            defaultValue = '',
            confirmText = 'Submit',
            cancelText = 'Cancel',
            onConfirm,
            onCancel
        } = options;

        const modalId = 'promptModal-' + Date.now();
        
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${message ? `<p class="mb-3">${message}</p>` : ''}
                            <input type="${inputType}" 
                                   class="form-control" 
                                   id="promptInput" 
                                   placeholder="${placeholder}"
                                   value="${defaultValue}">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                            <button type="button" class="btn btn-primary" id="promptConfirmBtn">${confirmText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        
        document.getElementById('promptConfirmBtn').addEventListener('click', () => {
            const value = document.getElementById('promptInput').value;
            modal.hide();
            if (onConfirm) onConfirm(value);
        });
        
        modal.show();
        
        // Clean up after hidden
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
            if (onCancel) onCancel();
        });
    }

    // Form Modal
    function showFormModal(options) {
        const {
            title = 'Form',
            fields = [], // Array of field objects { type, id, label, placeholder, required, options }
            onSubmit,
            onCancel,
            submitText = 'Submit',
            cancelText = 'Cancel'
        } = options;

        const modalId = 'formModal-' + Date.now();
        
        const fieldsHtml = fields.map(field => {
            if (field.type === 'select') {
                const optionsHtml = field.options.map(opt => 
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('');
                
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">${field.label}</label>
                        <select class="form-select" id="${field.id}" ${field.required ? 'required' : ''}>
                            ${optionsHtml}
                        </select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">${field.label}</label>
                        <textarea class="form-control" id="${field.id}" 
                                  placeholder="${field.placeholder || ''}" 
                                  ${field.required ? 'required' : ''} rows="3"></textarea>
                    </div>
                `;
            } else {
                return `
                    <div class="mb-3">
                        <label for="${field.id}" class="form-label">${field.label}</label>
                        <input type="${field.type || 'text'}" 
                               class="form-control" 
                               id="${field.id}" 
                               placeholder="${field.placeholder || ''}" 
                               ${field.required ? 'required' : ''}>
                    </div>
                `;
            }
        }).join('');

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="modalForm">
                                ${fieldsHtml}
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
                            <button type="button" class="btn btn-primary" id="formSubmitBtn">${submitText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        
        document.getElementById('formSubmitBtn').addEventListener('click', () => {
            const formData = {};
            fields.forEach(field => {
                formData[field.id] = document.getElementById(field.id).value;
            });
            
            modal.hide();
            if (onSubmit) onSubmit(formData);
        });
        
        modal.show();
        
        // Clean up after hidden
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
            if (onCancel) onCancel();
        });
    }

    // Loading Modal
    function showLoadingModal(message = 'Loading...') {
        const modalId = 'loadingModal';
        
        // Remove existing loading modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHtml = `
            <div class="modal fade" id="${modalId}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content bg-transparent border-0">
                        <div class="modal-body text-center">
                            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="text-white mt-2">${message}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        return modal;
    }

    // Hide Loading Modal
    function hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
            setTimeout(() => modal.remove(), 300);
        }
    }

    // Image Preview Modal
    function showImageModal(imageUrl, title = 'Image Preview') {
        const modalId = 'imageModal-' + Date.now();
        
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <img src="${imageUrl}" alt="${title}" class="img-fluid">
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Clean up after hidden
        document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
            document.getElementById(modalId).remove();
        });
    }

    // Public API
    return {
        confirm: showConfirmModal,
        alert: showAlertModal,
        prompt: showPromptModal,
        form: showFormModal,
        showLoading: showLoadingModal,
        hideLoading: hideLoadingModal,
        showImage: showImageModal
    };
})();