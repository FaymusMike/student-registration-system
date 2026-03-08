// Main Application Module

const App = (function() {
    // DOM Elements
    let darkModeToggle;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Initialize application
    function init() {
        setupEventListeners();
        loadTheme();
        initializeCharts();
        loadDashboardData();
        setupLocationAutocomplete();
    }

    // Theme management
    function loadTheme() {
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        updateThemeIcon();
    }

    function toggleDarkMode() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        updateThemeIcon();
        
        // Update charts for dark mode
        updateChartsTheme();
    }

    function updateThemeIcon() {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Charts initialization using Chart.js
    function initializeCharts() {
        // Revenue chart
        const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [12000, 19000, 15000, 25000, 22000, 30000],
                        borderColor: '#0d6efd',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Payment distribution chart
        const paymentCtx = document.getElementById('paymentChart')?.getContext('2d');
        if (paymentCtx) {
            new Chart(paymentCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending', 'Failed'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: ['#198754', '#ffc107', '#dc3545']
                    }]
                }
            });
        }
    }

    // Load dashboard data
    function loadDashboardData() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        // Update user profile section
        document.getElementById('userName')?.textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('userEmail')?.textContent = user.email;
        
        // Load avatar
        const avatarImg = document.getElementById('userAvatar');
        if (avatarImg) {
            avatarImg.src = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
        }

        // Load statistics for admin
        if (user.role === 'admin') {
            loadAdminStats();
        }
    }

    // Load admin statistics
    function loadAdminStats() {
        const users = Storage.getUsers();
        const payments = Storage.getPayments();
        const courses = Storage.getCourses();
        
        // Update counters
        document.getElementById('totalStudents')?.textContent = users.filter(u => u.role === 'student').length;
        document.getElementById('totalPayments')?.textContent = payments.length;
        document.getElementById('totalRevenue')?.textContent = formatCurrency(
            payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
        );
        document.getElementById('totalCourses')?.textContent = courses.length;
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Location autocomplete using GeoDB Cities API
    async function setupLocationAutocomplete() {
        const locationInput = document.getElementById('location');
        if (!locationInput) return;

        locationInput.addEventListener('input', debounce(async function(e) {
            const query = e.target.value;
            if (query.length < 3) return;

            try {
                // Using RapidAPI GeoDB Cities API
                const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}`, {
                    headers: {
                        'X-RapidAPI-Key': 'YOUR_API_KEY', // Replace with actual API key
                        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                    }
                });
                
                const data = await response.json();
                displayLocationSuggestions(data.data);
            } catch (error) {
                console.error('Location autocomplete error:', error);
            }
        }, 300));
    }

    // Display location suggestions
    function displayLocationSuggestions(cities) {
        const suggestionsDiv = document.getElementById('locationSuggestions');
        if (!suggestionsDiv) return;

        suggestionsDiv.innerHTML = cities.map(city => `
            <div class="suggestion-item p-2" onclick="selectLocation('${city.city}', '${city.country}')">
                ${city.city}, ${city.country}
            </div>
        `).join('');
    }

    // Debounce function
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

    // Course registration
    async function registerCourses(courseIds) {
        const user = Auth.getCurrentUser();
        if (!user) return;

        try {
            const totalFees = Storage.calculateTotalFees(courseIds);
            
            const registration = Storage.createRegistration({
                studentId: user.id,
                courses: courseIds,
                totalFees,
                session: new Date().getFullYear().toString()
            });

            // Initialize payment
            const paymentRef = await initializePayment(totalFees, registration.id);
            
            return {
                success: true,
                registration,
                paymentRef
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Failed to register courses'
            };
        }
    }

    // Initialize payment with Paystack
    async function initializePayment(amount, registrationId) {
        // Simulate Paystack integration
        const paymentRef = Storage.generatePaymentReference();
        
        // In production, this would call Paystack API
        return paymentRef;
    }

    // Generate PDF receipt
    function generateReceipt(paymentId) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const payment = Storage.getPayments().find(p => p.id === paymentId);
        const user = Storage.getUserById(payment?.studentId);
        
        if (!payment || !user) return;

        doc.setFontSize(20);
        doc.text('Payment Receipt', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Receipt No: ${payment.id}`, 20, 40);
        doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 20, 50);
        doc.text(`Student: ${user.firstName} ${user.lastName}`, 20, 60);
        doc.text(`Email: ${user.email}`, 20, 70);
        doc.text(`Amount: ${formatCurrency(payment.amount)}`, 20, 80);
        doc.text(`Status: ${payment.status}`, 20, 90);
        
        // Generate QR code for verification
        const qrData = JSON.stringify({
            receipt: payment.id,
            student: user.id,
            amount: payment.amount,
            date: payment.createdAt
        });
        
        // In production, use QRCode.js to generate and embed QR code
        
        doc.save(`receipt-${payment.id}.pdf`);
    }

    // Export data to Excel
    function exportToExcel(data, filename) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    // Public API
    return {
        init,
        toggleDarkMode,
        registerCourses,
        generateReceipt,
        exportToExcel,
        formatCurrency
    };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => App.init());

// Make functions globally available
window.toggleDarkMode = () => App.toggleDarkMode();