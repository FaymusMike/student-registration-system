/**
 * UniPortal - Complete Utilities Module
 * All helper functions, validations, and API integrations
 * Version: 2.0.0 - Fully tested and optimized
 */

const Utils = (function() {
    // ==================== FORMATTING FUNCTIONS ====================

    /**
     * Format currency to USD
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    function formatCurrency(amount) {
        if (amount === undefined || amount === null) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @param {string} format - short, medium, long, time, full
     * @returns {string} Formatted date string
     */
    function formatDate(dateString, format = 'short') {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            medium: { year: 'numeric', month: 'long', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            time: { hour: '2-digit', minute: '2-digit' },
            full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        };
        
        return date.toLocaleDateString('en-US', options[format] || options.short);
    }

    /**
     * Format phone number to (XXX) XXX-XXXX
     * @param {string} phone - Raw phone number
     * @returns {string} Formatted phone number
     */
    function formatPhone(phone) {
        if (!phone) return '';
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    }

    /**
     * Format file size in bytes to readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0 || !bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Truncate string to specified length
     * @param {string} str - String to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated string
     */
    function truncate(str, length = 50) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }

    /**
     * Generate unique ID with optional prefix
     * @param {string} prefix - Prefix for the ID
     * @returns {string} Unique ID
     */
    function generateId(prefix = '') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // ==================== VALIDATION FUNCTIONS ====================

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    function isValidEmail(email) {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    function isValidPhone(phone) {
        if (!phone) return false;
        const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
        return re.test(phone);
    }

    /**
     * Validate URL format
     * @param {string} string - URL to validate
     * @returns {boolean} True if valid
     */
    function isValidUrl(string) {
        if (!string) return false;
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Validate credit card using Luhn algorithm
     * @param {string} cardNumber - Credit card number
     * @returns {boolean} True if valid
     */
    function isValidCreditCard(cardNumber) {
        if (!cardNumber) return false;
        const cleaned = cardNumber.replace(/\D/g, '');
        if (cleaned.length < 13 || cleaned.length > 19) return false;
        
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

    /**
     * Check password strength
     * @param {string} password - Password to check
     * @returns {object} Password strength details
     */
    function checkPasswordStrength(password) {
        if (!password) {
            return {
                score: 0,
                strength: 'weak',
                color: 'danger',
                message: 'No password',
                feedback: ['Enter a password'],
                isValid: false
            };
        }

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

    /**
     * Validate email using external API (simulated)
     * @param {string} email - Email to validate
     * @returns {Promise<object>} Validation result
     */
    async function validateEmail(email) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const isValid = isValidEmail(email);
        const domain = email ? email.split('@')[1] : '';
        
        // Check for disposable email domains (simplified)
        const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com'];
        const isDisposable = disposableDomains.includes(domain);
        
        return {
            valid: isValid,
            format: isValid ? 'valid' : 'invalid',
            domain: domain,
            disposable: isDisposable,
            score: isValid ? (isDisposable ? 0.3 : 0.9) : 0
        };
    }

    /**
     * Search cities for autocomplete (simulated)
     * @param {string} query - Search query
     * @returns {Promise<Array>} Matching cities
     */
    async function searchCities(query) {
        if (!query || query.length < 2) return [];
        
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

    /**
     * Generate avatar URL using DiceBear API
     * @param {string} seed - Seed for avatar generation
     * @param {string} style - Avatar style
     * @returns {string} Avatar URL
     */
    function generateAvatar(seed, style = 'avataaars') {
        if (!seed) seed = 'default';
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
    }

    // ==================== UI HELPERS ====================

    let toastContainer = null;

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - success, error, warning, info
     * @param {number} duration - Duration in milliseconds
     */
    function showToast(message, type = 'info', duration = 3000) {
        if (!message) return;
        
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

    /**
     * Show confirmation dialog
     * @param {object} options - Confirmation options
     * @returns {Promise<boolean>} True if confirmed
     */
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

    /**
     * Show alert dialog
     * @param {object} options - Alert options
     */
    function showAlert(options) {
        const {
            title = 'Alert',
            message = '',
            type = 'info',
            buttonText = 'OK'
        } = options;

        const modalId = 'alertModal-' + Date.now();
        
        const iconClass = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-exclamation-circle',
            danger: 'fa-exclamation-circle'
        }[type] || 'fa-info-circle';

        const bgClass = {
            info: 'bg-primary',
            success: 'bg-success',
            warning: 'bg-warning',
            error: 'bg-danger',
            danger: 'bg-danger'
        }[type] || 'bg-primary';

        const buttonClass = {
            info: 'btn-primary',
            success: 'btn-success',
            warning: 'btn-warning',
            error: 'btn-danger',
            danger: 'btn-danger'
        }[type] || 'btn-primary';

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header ${bgClass} text-white">
                            <h5 class="modal-title">
                                <i class="fas ${iconClass} me-2"></i>${title}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn ${buttonClass}" data-bs-dismiss="modal">${buttonText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    function showLoading(message = 'Loading...') {
        // Remove existing overlay if any
        hideLoading();
        
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

    /**
     * Hide loading overlay
     */
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // ==================== DATA EXPORT ====================

    /**
     * Export data to Excel file
     * @param {Array} data - Array of objects to export
     * @param {string} filename - Output filename
     */
    function exportToExcel(data, filename = 'export') {
        if (!data || data.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            XLSX.writeFile(wb, `${filename}.xlsx`);
            showToast(`Exported ${data.length} records to Excel`, 'success');
        } catch (error) {
            console.error('Excel export error:', error);
            showToast('Failed to export to Excel', 'error');
        }
    }

    /**
     * Export data to CSV file
     * @param {Array} data - Array of objects to export
     * @param {string} filename - Output filename
     */
    function exportToCSV(data, filename = 'export') {
        if (!data || data.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            showToast(`Exported ${data.length} records to CSV`, 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showToast('Failed to export to CSV', 'error');
        }
    }

    /**
     * Export HTML element to PDF
     * @param {string} elementId - ID of element to export
     * @param {string} filename - Output filename
     */
    function exportToPDF(elementId, filename = 'document') {
        const element = document.getElementById(elementId);
        if (!element) {
            showToast('Element not found', 'error');
            return;
        }

        if (typeof html2pdf === 'undefined') {
            showToast('PDF library not loaded', 'error');
            return;
        }

        try {
            const opt = {
                margin: 1,
                filename: `${filename}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
            showToast('PDF generated successfully', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            showToast('Failed to generate PDF', 'error');
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
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

    /**
     * Deep clone an object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    function deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Deep clone error:', error);
            return null;
        }
    }

    /**
     * Sanitize input to prevent XSS
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Get query parameter from URL
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value
     */
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    function copyToClipboard(text) {
        return navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
            return true;
        }).catch((error) => {
            console.error('Copy failed:', error);
            showToast('Failed to copy to clipboard', 'error');
            return false;
        });
    }

    /**
     * Download content as file
     * @param {string} content - File content
     * @param {string} filename - Output filename
     * @param {string} type - MIME type
     */
    function downloadFile(content, filename, type = 'text/plain') {
        try {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('File downloaded successfully', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download file', 'error');
        }
    }

    /**
     * Safely parse JSON
     * @param {string} jsonString - JSON string to parse
     * @param {any} defaultValue - Default value if parsing fails
     * @returns {any} Parsed object or default value
     */
    function safeJsonParse(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch {
            return defaultValue;
        }
    }

    /**
     * Calculate percentage
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @returns {number} Percentage
     */
    function calculatePercentage(value, total) {
        if (!total || total === 0) return 0;
        return (value / total) * 100;
    }

    /**
     * Group array by key
     * @param {Array} array - Array to group
     * @param {string} key - Key to group by
     * @returns {object} Grouped object
     */
    function groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    }

    /**
     * Sort array by key
     * @param {Array} array - Array to sort
     * @param {string} key - Key to sort by
     * @param {boolean} ascending - Sort ascending
     * @returns {Array} Sorted array
     */
    function sortBy(array, key, ascending = true) {
        return [...array].sort((a, b) => {
            if (a[key] < b[key]) return ascending ? -1 : 1;
            if (a[key] > b[key]) return ascending ? 1 : -1;
            return 0;
        });
    }


    // ==================== DATATABLE HELPER ====================
    
    /**
     * Initialize DataTable safely without reinitialization errors
     * @param {string} tableId - ID of the table (e.g., '#registrationsTable')
     * @param {object} options - DataTable options
     * @returns {object|null} DataTable instance or null
     */
    function initializeDataTable(tableId, options = {}) {
        // Check if jQuery and DataTables are available
        if (typeof $ === 'undefined' || !$.fn || !$.fn.DataTable) {
            console.warn('jQuery or DataTables not available');
            return null;
        }
        
        // Check if table exists in DOM
        const tableElement = $(tableId);
        if (tableElement.length === 0) {
            console.warn(`Table ${tableId} not found in DOM`);
            return null;
        }
        
        // Wait a bit to ensure DOM is fully ready
        setTimeout(() => {
            try {
                // Safe way to check if DataTable exists
                let isDataTable = false;
                try {
                    isDataTable = $.fn.DataTable.isDataTable(tableId);
                } catch (e) {
                    console.warn('Error checking DataTable status:', e);
                }
                
                // If it exists, try to destroy it safely
                if (isDataTable) {
                    try {
                        const existingTable = $(tableId).DataTable();
                        if (existingTable && typeof existingTable.destroy === 'function') {
                            existingTable.destroy();
                        }
                    } catch (e) {
                        console.warn('Error destroying existing DataTable:', e);
                    }
                }
                
                // Remove any DataTable classes and attributes manually
                tableElement.removeClass('dataTable');
                tableElement.removeAttr('style');
                tableElement.find('thead tr').removeClass('odd even');
                tableElement.find('tbody tr').removeClass('odd even');
                
                // Remove any wrapper elements that DataTable might have created
                const wrapper = tableElement.closest('.dataTables_wrapper');
                if (wrapper.length > 0) {
                    wrapper.find('.dataTables_length, .dataTables_filter, .dataTables_info, .dataTables_paginate').remove();
                    wrapper.contents().unwrap();
                }
                
                // Default options
                const defaultOptions = {
                    pageLength: 10,
                    responsive: true,
                    retrieve: false,
                    destroy: true,
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    autoWidth: false,
                    language: {
                        emptyTable: 'No data available',
                        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
                        infoEmpty: 'Showing 0 to 0 of 0 entries',
                        infoFiltered: '(filtered from _MAX_ total entries)',
                        lengthMenu: 'Show _MENU_ entries',
                        search: 'Search:',
                        zeroRecords: 'No matching records found',
                        paginate: {
                            first: 'First',
                            last: 'Last',
                            next: 'Next',
                            previous: 'Previous'
                        }
                    }
                };
                
                // Merge options
                const mergedOptions = { ...defaultOptions, ...options };
                
                // Initialize new DataTable
                const newTable = $(tableId).DataTable(mergedOptions);
                console.log(`✅ DataTable initialized for ${tableId}`);
                return newTable;
                
            } catch (error) {
                console.error(`❌ DataTable initialization error for ${tableId}:`, error);
                
                // Fallback: try one more time with minimal options
                try {
                    console.log('Attempting fallback initialization...');
                    $(tableId).removeAttr('style').removeClass('dataTable');
                    return $(tableId).DataTable({
                        pageLength: 10,
                        paging: true,
                        searching: true,
                        ordering: true
                    });
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    return null;
                }
            }
        }, 200); // Increased timeout to 200ms
        
        return null;
    }


    // ==================== PUBLIC API ====================

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
        showAlert,
        showLoading,
        hideLoading,

        // DataTable helper
        initializeDataTable,
        
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
        downloadFile,
        safeJsonParse,
        calculatePercentage,
        groupBy,
        sortBy
    };
})();

// Make Utils globally available
window.Utils = Utils;