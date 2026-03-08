/**
 * UniPortal - Utilities Module
 * Handles all utility functions, API integrations, and helpers
 */

const Utils = (function() {
    // ==================== API CONFIGURATION ====================
    const API_CONFIG = {
        emailValidation: {
            key: 'YOUR_API_KEY', // Replace with actual API key
            url: 'https://emailvalidation.abstractapi.com/v1/'
        },
        paystack: {
            publicKey: 'pk_test_xxxxxxxxxxxxxxxx', // Replace with test key
            url: 'https://api.paystack.co'
        },
        geoDB: {
            key: 'YOUR_RAPIDAPI_KEY', // Replace with RapidAPI key
            host: 'wft-geo-db.p.rapidapi.com'
        }
    };

    // ==================== FORMATTING FUNCTIONS ====================
    
    /**
     * Format currency to USD
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format date
     */
    function formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        const options = format === 'short' 
            ? { year: 'numeric', month: 'short', day: 'numeric' }
            : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Generate unique ID
     */
    function generateId(prefix = '') {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // ==================== VALIDATION FUNCTIONS ====================

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Check password strength
     */
    function checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) {
            score += 25;
        } else {
            feedback.push('At least 8 characters');
        }

        if (/[A-Z]/.test(password)) {
            score += 25;
        } else {
            feedback.push('One uppercase letter');
        }

        if (/[a-z]/.test(password)) {
            score += 25;
        } else {
            feedback.push('One lowercase letter');
        }

        if (/[0-9]/.test(password)) {
            score += 15;
        } else {
            feedback.push('One number');
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score += 10;
        } else {
            feedback.push('One special character');
        }

        let strength = 'weak';
        let color = 'danger';

        if (score >= 80) {
            strength = 'strong';
            color = 'success';
        } else if (score >= 60) {
            strength = 'medium';
            color = 'warning';
        }

        return {
            score,
            strength,
            color,
            feedback,
            isValid: score >= 60
        };
    }

    // ==================== API INTEGRATIONS ====================

    /**
     * Validate email using external API
     */
    async function validateEmail(email) {
        try {
            // Simulate API call (replace with actual API)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Demo validation
            const isValid = isValidEmail(email);
            const domain = email.split('@')[1];
            
            return {
                valid: isValid,
                format: isValid ? 'valid' : 'invalid',
                domain: domain,
                disposable: domain?.includes('tempmail') || domain?.includes('throwaway'),
                score: isValid ? 0.85 : 0
            };
        } catch (error) {
            console.error('Email validation error:', error);
            return {
                valid: isValidEmail(email),
                error: 'API unavailable'
            };
        }
    }

    /**
     * Search cities for autocomplete
     */
    async function searchCities(query) {
        // Mock data for demo
        const mockCities = [
            { city: 'New York', country: 'United States' },
            { city: 'Los Angeles', country: 'United States' },
            { city: 'Chicago', country: 'United States' },
            { city: 'Houston', country: 'United States' },
            { city: 'London', country: 'United Kingdom' },
            { city: 'Manchester', country: 'United Kingdom' },
            { city: 'Toronto', country: 'Canada' },
            { city: 'Vancouver', country: 'Canada' },
            { city: 'Sydney', country: 'Australia' },
            { city: 'Melbourne', country: 'Australia' }
        ];

        return mockCities.filter(c => 
            c.city.toLowerCase().includes(query.toLowerCase()) ||
            c.country.toLowerCase().includes(query.toLowerCase())
        );
    }

    /**
     * Generate avatar using DiceBear
     */
    function generateAvatar(seed, style = 'avataaars') {
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    }

    /**
     * Initialize Paystack payment
     */
    function initializePaystackPayment(email, amount, callback) {
        const handler = PaystackPop.setup({
            key: API_CONFIG.paystack.publicKey,
            email: email,
            amount: amount * 100, // Convert to kobo
            currency: 'USD',
            callback: function(response) {
                callback({
                    success: true,
                    reference: response.reference,
                    message: 'Payment successful'
                });
            },
            onClose: function() {
                callback({
                    success: false,
                    message: 'Payment window closed'
                });
            }
        });
        
        handler.openIframe();
    }

    // ==================== UI HELPERS ====================

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.querySelector('.toast-container') || (() => {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            return container;
        })();

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                      type === 'error' ? 'exclamation-circle' : 
                                      type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: duration });
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    /**
     * Show confirmation dialog
     */
    function confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modalId = 'confirmModal';
            let modal = document.getElementById(modalId);

            if (!modal) {
                modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal fade';
                modal.innerHTML = `
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
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="confirmBtn">Confirm</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            const modalInstance = new bootstrap.Modal(modal);
            document.getElementById('confirmBtn').onclick = () => {
                modalInstance.hide();
                resolve(true);
            };

            modal.addEventListener('hidden.bs.modal', () => resolve(false));
            modalInstance.show();
        });
    }

    /**
     * Show loading spinner
     */
    function showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'spinner-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white mt-2">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Hide loading spinner
     */
    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    }

    /**
     * Export data to Excel
     */
    function exportToExcel(data, filename = 'export') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    /**
     * Debounce function
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Public API
    return {
        formatCurrency,
        formatDate,
        generateId,
        isValidEmail,
        checkPasswordStrength,
        validateEmail,
        searchCities,
        generateAvatar,
        initializePaystackPayment,
        showToast,
        confirm,
        showLoading,
        hideLoading,
        exportToExcel,
        debounce
    };
})();

// Make utils globally available
window.Utils = Utils;