/**
 * UniPortal - Complete Utilities Module
 * All helper functions, validations, and API integrations
 */

const Utils = (function() {
    // ==================== FORMATTING FUNCTIONS ====================

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            medium: { year: 'numeric', month: 'long', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            time: { hour: '2-digit', minute: '2-digit' },
            full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        };
        
        return date.toLocaleDateString('en-US', options[format] || options.short);
    }

    function formatPhone(phone) {
        // Format as (XXX) XXX-XXXX
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function truncate(str, length = 50) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    function generateId(prefix = '') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // ==================== VALIDATION FUNCTIONS ====================

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function isValidPhone(phone) {
        const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
        return re.test(phone);
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function isValidCreditCard(cardNumber) {
        // Luhn algorithm
        const cleaned = cardNumber.replace(/\D/g, '');
        let sum = 0;
        let alternate = false;
        
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let n = parseInt(cleaned.charAt(i), 10);
            if (alternate) {
                n *= 2;
                if (n > 9) n = (n % 10) + 1;
            }
            sum += n;
            alternate = !alternate;
        }
        
        return (sum % 10 === 0);
    }

    function checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        // Length check
        if (password.length >= 8) {
            score += 25;
        } else {
            feedback.push('At least 8 characters');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 25;
        } else {
            feedback.push('One uppercase letter');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 25;
        } else {
            feedback.push('One lowercase letter');
        }

        // Number check
        if (/[0-9]/.test(password)) {
            score += 15;
        } else {
            feedback.push('One number');
        }

        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) {
            score += 10;
        } else {
            feedback.push('One special character (!@#$%^&*)');
        }

        let strength = 'weak';
        let color = 'danger';
        let message = 'Weak password';

        if (score >= 80) {
            strength = 'strong';
            color = 'success';
            message = 'Strong password';
        } else if (score >= 60) {
            strength = 'medium';
            color = 'warning';
            message = 'Medium password';
        }

        return {
            score,
            strength,
            color,
            message,
            feedback,
            isValid: score >= 60
        };
    }

    // ==================== API INTEGRATIONS ====================

    async function validateEmail(email) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const isValid = isValidEmail(email);
        const domain = email.split('@')[1];
        
        // Check for disposable email domains (simplified)
        const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
        const isDisposable = disposableDomains.includes(domain);
        
        return {
            valid: isValid,
            format: isValid ? 'valid' : 'invalid',
            domain: domain,
            disposable: isDisposable,
            score: isValid ? (isDisposable ? 0.3 : 0.9) : 0
        };
    }

    async function searchCities(query) {
        // Mock city data
        const cities = [
            { city: 'New York', country: 'United States', region: 'NY' },
            { city: 'Los Angeles', country: 'United States', region: 'CA' },
            { city: 'Chicago', country: 'United States', region: 'IL' },
            { city: 'Houston', country: 'United States', region: 'TX' },
            { city: 'Phoenix', country: 'United States', region: 'AZ' },
            { city: 'Philadelphia', country: 'United States', region: 'PA' },
            { city: 'San Antonio', country: 'United States', region: 'TX' },
            { city: 'San Diego', country: 'United States', region: 'CA' },
            { city: 'Dallas', country: 'United States', region: 'TX' },
            { city: 'San Jose', country: 'United States', region: 'CA' },
            { city: 'London', country: 'United Kingdom', region: 'England' },
            { city: 'Manchester', country: 'United Kingdom', region: 'England' },
            { city: 'Birmingham', country: 'United Kingdom', region: 'England' },
            { city: 'Toronto', country: 'Canada', region: 'Ontario' },
            { city: 'Vancouver', country: 'Canada', region: 'BC' },
            { city: 'Montreal', country: 'Canada', region: 'Quebec' },
            { city: 'Sydney', country: 'Australia', region: 'NSW' },
            { city: 'Melbourne', country: 'Australia', region: 'VIC' },
            { city: 'Brisbane', country: 'Australia', region: 'QLD' }
        ];
        
        const queryLower = query.toLowerCase();
        return cities.filter(c => 
            c.city.toLowerCase().includes(queryLower) ||
            c.country.toLowerCase().includes(queryLower)
        );
    }

    function generateAvatar(seed, style = 'avataaars') {
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    }

    // ==================== UI HELPERS ====================

    let toastContainer = null;

    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        const icon = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        }[type] || 'fa-info-circle';

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { 
            autohide: true, 
            delay: duration,
            animation: true
        });
        
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    function showConfirm(options) {
        return new Promise((resolve) => {
            const {
                title = 'Confirm Action',
                message = 'Are you sure?',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                type = 'primary',
                onConfirm,
                onCancel
            } = options;

            const modalId = 'confirmModal-' + Date.now();
            
            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-${type} text-white">
                                <h5 class="modal-title">
                                    <i class="fas fa-question-circle me-2"></i>
                                    ${title}
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
                resolve(true);
            });
            
            modal.show();
            
            document.getElementById(modalId).addEventListener('hidden.bs.modal', () => {
                document.getElementById(modalId).remove();
                if (onCancel) onCancel();
                resolve(false);
            });
        });
    }

    function showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'spinner-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white mt-3">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // ==================== DATA EXPORT ====================

    function exportToExcel(data, filename = 'export') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    function exportToCSV(data, filename = 'export') {
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function exportToPDF(elementId, filename = 'document') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const opt = {
            margin: 1,
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    }

    // ==================== UTILITY FUNCTIONS ====================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function copyToClipboard(text) {
        return navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
            return true;
        }).catch(() => {
            showToast('Failed to copy', 'error');
            return false;
        });
    }

    function downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Public API
    return {
        // Formatting
        formatCurrency,
        formatDate,
        formatPhone,
        formatFileSize,
        truncate,
        generateId,
        
        // Validation
        isValidEmail,
        isValidPhone,
        isValidUrl,
        isValidCreditCard,
        checkPasswordStrength,
        
        // API
        validateEmail,
        searchCities,
        generateAvatar,
        
        // UI
        showToast,
        showConfirm,
        showLoading,
        hideLoading,
        
        // Export
        exportToExcel,
        exportToCSV,
        exportToPDF,
        
        // Utilities
        debounce,
        throttle,
        deepClone,
        sanitizeInput,
        getQueryParam,
        copyToClipboard,
        downloadFile
    };
})();

// Make Utils globally available
window.Utils = Utils;