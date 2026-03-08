/**
 * UniPortal - Main Application Module
 * Handles dashboard rendering, UI interactions, and page-specific logic
 */

const App = (function() {
    // ==================== INITIALIZATION ====================

    /**
     * Initialize application
     */
    function init() {
        setupEventListeners();
        checkTheme();
        loadPageContent();
    }

    /**
     * Setup global event listeners
     */
    function setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }

        // Logout buttons
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        });
    }

    // ==================== THEME MANAGEMENT ====================

    /**
     * Check and apply saved theme
     */
    function checkTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            updateThemeIcon(true);
        }
    }

    /**
     * Toggle dark/light theme
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }

    /**
     * Update theme toggle icon
     */
    function updateThemeIcon(isDark) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ==================== SIDEBAR MANAGEMENT ====================

    /**
     * Toggle mobile sidebar
     */
    function toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('show');
    }

    /**
     * Render sidebar based on user role
     */
    function renderSidebar() {
        const user = Auth.getCurrentUser();
        if (!user) return '';

        const menuItems = user.role === 'admin' ? [
            { icon: 'fa-home', text: 'Dashboard', url: 'dashboard.html?admin' },
            { icon: 'fa-users', text: 'Students', url: 'dashboard.html?tab=students' },
            { icon: 'fa-book', text: 'Courses', url: 'dashboard.html?tab=courses' },
            { icon: 'fa-credit-card', text: 'Payments', url: 'dashboard.html?tab=payments' },
            { icon: 'fa-clock', text: 'Approvals', url: 'dashboard.html?tab=approvals' },
            { icon: 'fa-chart-bar', text: 'Reports', url: 'dashboard.html?tab=reports' },
            { icon: 'fa-cog', text: 'Settings', url: 'dashboard.html?tab=settings' }
        ] : [
            { icon: 'fa-home', text: 'Dashboard', url: 'dashboard.html' },
            { icon: 'fa-user', text: 'Profile', url: 'dashboard.html?tab=profile' },
            { icon: 'fa-book', text: 'Course Registration', url: 'dashboard.html?tab=courses' },
            { icon: 'fa-credit-card', text: 'Make Payment', url: 'dashboard.html?tab=payments' },
            { icon: 'fa-history', text: 'Payment History', url: 'dashboard.html?tab=history' },
            { icon: 'fa-download', text: 'Receipts', url: 'dashboard.html?tab=receipts' }
        ];

        return `
            <div class="sidebar">
                <div class="p-3">
                    <a href="index.html" class="text-decoration-none">
                        <i class="fas fa-university fa-2x text-primary"></i>
                        <h5 class="mt-2">UniPortal</h5>
                    </a>
                </div>
                
                <div class="sidebar-user p-3 border-top border-bottom">
                    <div class="d-flex align-items-center">
                        <img src="${user.avatar}" alt="Avatar" class="rounded-circle me-2" width="40" height="40">
                        <div>
                            <div class="fw-bold">${user.firstName} ${user.lastName}</div>
                            <small class="text-muted">${user.role === 'admin' ? 'Administrator' : 'Student'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-menu">
                    ${menuItems.map(item => `
                        <a href="${item.url}" class="nav-link ${isActive(item.url) ? 'active' : ''}">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.text}</span>
                        </a>
                    `).join('')}
                </div>
                
                <div class="p-3 border-top">
                    <button class="btn btn-danger w-100 logout-btn">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Check if menu item is active
     */
    function isActive(url) {
        const currentUrl = window.location.href;
        return currentUrl.includes(url.split('?')[1] || '');
    }

    // ==================== PAGE LOADING ====================

    /**
     * Load page content based on URL parameters
     */
    function loadPageContent() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') || 'dashboard';
        const isAdmin = window.location.href.includes('admin');

        if (window.location.pathname.includes('dashboard.html')) {
            loadDashboard(tab, isAdmin);
        }
    }

    /**
     * Load dashboard content
     */
    function loadDashboard(tab, isAdmin) {
        const container = document.getElementById('dashboardContent');
        if (!container) return;

        if (isAdmin) {
            loadAdminDashboard(tab, container);
        } else {
            loadStudentDashboard(tab, container);
        }
    }

    /**
     * Load student dashboard
     */
    function loadStudentDashboard(tab, container) {
        switch(tab) {
            case 'profile':
                loadStudentProfile(container);
                break;
            case 'courses':
                loadCourseRegistration(container);
                break;
            case 'payments':
                loadPaymentPage(container);
                break;
            case 'history':
                loadPaymentHistory(container);
                break;
            case 'receipts':
                loadReceipts(container);
                break;
            default:
                loadStudentHome(container);
        }
    }

    /**
     * Load admin dashboard
     */
    function loadAdminDashboard(tab, container) {
        switch(tab) {
            case 'students':
                loadStudentsList(container);
                break;
            case 'courses':
                loadCourseManagement(container);
                break;
            case 'payments':
                loadAllPayments(container);
                break;
            case 'approvals':
                loadApprovals(container);
                break;
            case 'reports':
                loadReports(container);
                break;
            case 'settings':
                loadSettings(container);
                break;
            default:
                loadAdminHome(container);
        }
    }

    // ==================== STUDENT DASHBOARD COMPONENTS ====================

    /**
     * Load student home dashboard
     */
    function loadStudentHome(container) {
        const user = Auth.getCurrentUser();
        const payments = Data.getPayments({ studentId: user.id });
        const registrations = Data.getRegistrations({ studentId: user.id });
        const courses = Data.getCourses();

        const completedPayments = payments.filter(p => p.status === 'completed');
        const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingReg = registrations.filter(r => r.status === 'pending').length;

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Welcome back, ${user.firstName}!</h2>
                
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Paid</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(totalPaid)}</h3>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="stat-card" style="background: linear-gradient(135deg, #198754, #0f5132);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Courses</h6>
                                    <h3 class="text-white">${courses.length}</h3>
                                </div>
                                <i class="fas fa-book stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #997404);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Pending</h6>
                                    <h3 class="text-white">${pendingReg}</h3>
                                </div>
                                <i class="fas fa-clock stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #087990);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Payments</h6>
                                    <h3 class="text-white">${payments.length}</h3>
                                </div>
                                <i class="fas fa-credit-card stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="table-container">
                            <h5 class="mb-3">Recent Payments</h5>
                            ${renderRecentPayments(payments.slice(0, 5))}
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="table-container">
                            <h5 class="mb-3">Available Courses</h5>
                            ${renderAvailableCourses(courses.slice(0, 5))}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load course registration page
     */
    function loadCourseRegistration(container) {
        const courses = Data.getCourses();
        const user = Auth.getCurrentUser();
        const registrations = Data.getRegistrations({ studentId: user.id });
        const currentReg = registrations.find(r => r.status === 'pending' || r.status === 'approved');

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Course Registration</h2>
                
                ${currentReg ? renderCurrentRegistration(currentReg) : ''}
                
                <div class="table-container mt-4">
                    <h5 class="mb-3">Available Courses</h5>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Course</th>
                                    <th>Credits</th>
                                    <th>Fee</th>
                                    <th>Schedule</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map(course => `
                                    <tr>
                                        <td>${course.code}</td>
                                        <td>${course.title}</td>
                                        <td>${course.credits}</td>
                                        <td>${Utils.formatCurrency(course.fee)}</td>
                                        <td>${course.schedule}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="App.selectCourse('${course.id}')">
                                                <i class="fas fa-plus"></i> Select
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load payment page
     */
    function loadPaymentPage(container) {
        const user = Auth.getCurrentUser();
        const registrations = Data.getRegistrations({ studentId: user.id, status: 'approved' });
        const pendingPayments = Data.getPayments({ studentId: user.id, status: 'pending' });

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Make Payment</h2>
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="table-container">
                            <h5 class="mb-3">Outstanding Fees</h5>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${registrations.map(reg => `
                                        <tr>
                                            <td>Course Registration (${reg.id})</td>
                                            <td>${Utils.formatCurrency(reg.totalFees)}</td>
                                            <td>${Utils.formatDate(new Date(Date.now() + 7*86400000))}</td>
                                            <td>
                                                <input type="checkbox" class="payment-checkbox" data-amount="${reg.totalFees}">
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${pendingPayments.map(pay => `
                                        <tr>
                                            <td>${pay.description || 'Pending Payment'}</td>
                                            <td>${Utils.formatCurrency(pay.amount)}</td>
                                            <td>${Utils.formatDate(pay.createdAt)}</td>
                                            <td>
                                                <span class="badge bg-warning">Pending</span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="table-container">
                            <h5 class="mb-3">Payment Summary</h5>
                            <div class="mb-3">
                                <label class="form-label">Total Amount</label>
                                <h3 id="totalAmount">$0.00</h3>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Payment Method</label>
                                <select class="form-select" id="paymentMethod">
                                    <option value="paystack">Paystack</option>
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            
                            <button class="btn btn-primary w-100" onclick="App.processPayment()">
                                <i class="fas fa-lock me-2"></i>Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for checkboxes
        document.querySelectorAll('.payment-checkbox').forEach(cb => {
            cb.addEventListener('change', updateTotalAmount);
        });
    }

    // ==================== ADMIN DASHBOARD COMPONENTS ====================

    /**
     * Load admin home dashboard
     */
    function loadAdminHome(container) {
        const stats = Data.getDashboardStats();

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Admin Dashboard</h2>
                
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Students</h6>
                                    <h3 class="text-white">${stats.totalStudents}</h3>
                                </div>
                                <i class="fas fa-users stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="stat-card" style="background: linear-gradient(135deg, #198754, #0f5132);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Revenue</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(stats.totalRevenue)}</h3>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #997404);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Pending</h6>
                                    <h3 class="text-white">${stats.pendingRegistrations}</h3>
                                </div>
                                <i class="fas fa-clock stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #087990);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Courses</h6>
                                    <h3 class="text-white">${stats.totalCourses}</h3>
                                </div>
                                <i class="fas fa-book stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="table-container">
                            <h5 class="mb-3">Recent Registrations</h5>
                            ${renderRecentRegistrations()}
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="table-container">
                            <h5 class="mb-3">Recent Payments</h5>
                            ${renderAllRecentPayments()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Load course management for admin
     */
    function loadCourseManagement(container) {
        const courses = Data.getCourses();

        container.innerHTML = `
            <div class="fade-in">
                <div class="d-flex justify-content-between mb-4">
                    <h2>Course Management</h2>
                    <button class="btn btn-primary" onclick="App.showAddCourseModal()">
                        <i class="fas fa-plus me-2"></i>Add Course
                    </button>
                </div>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Title</th>
                                <th>Credits</th>
                                <th>Fee</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courses.map(course => `
                                <tr>
                                    <td>${course.code}</td>
                                    <td>${course.title}</td>
                                    <td>${course.credits}</td>
                                    <td>${Utils.formatCurrency(course.fee)}</td>
                                    <td>${course.department}</td>
                                    <td>
                                        <button class="btn btn-sm btn-warning" onclick="App.editCourse('${course.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="App.deleteCourse('${course.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Load approvals page
     */
    function loadApprovals(container) {
        const registrations = Data.getRegistrations({ status: 'pending' });
        const users = Data.getUsers();

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Pending Approvals</h2>
                
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Courses</th>
                                <th>Total Fee</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registrations.map(reg => {
                                const student = users.find(u => u.id === reg.studentId);
                                const courses = Data.getCourses().filter(c => reg.courses.includes(c.id));
                                
                                return `
                                    <tr>
                                        <td>${student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</td>
                                        <td>${student ? student.email : ''}</td>
                                        <td>${courses.map(c => c.code).join(', ')}</td>
                                        <td>${Utils.formatCurrency(reg.totalFees)}</td>
                                        <td>${Utils.formatDate(reg.createdAt)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-success" onclick="App.approveRegistration('${reg.id}')">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="App.rejectRegistration('${reg.id}')">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ==================== RENDER HELPERS ====================

    function renderRecentPayments(payments) {
        if (payments.length === 0) {
            return '<p class="text-muted">No payments yet</p>';
        }

        return `
            <table class="table table-sm">
                <tbody>
                    ${payments.map(p => `
                        <tr>
                            <td>${Utils.formatDate(p.createdAt)}</td>
                            <td>${Utils.formatCurrency(p.amount)}</td>
                            <td><span class="badge bg-${p.status === 'completed' ? 'success' : 'warning'}">${p.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function renderAvailableCourses(courses) {
        if (courses.length === 0) {
            return '<p class="text-muted">No courses available</p>';
        }

        return `
            <ul class="list-group">
                ${courses.map(c => `
                    <li class="list-group-item d-flex justify-content-between">
                        <span>${c.code} - ${c.title}</span>
                        <span class="badge bg-primary">${c.credits} credits</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    function renderCurrentRegistration(reg) {
        const courses = Data.getCourses().filter(c => reg.courses.includes(c.id));
        
        return `
            <div class="alert alert-info">
                <h6 class="mb-2">Current Registration (${reg.status})</h6>
                <p class="mb-1">Courses: ${courses.map(c => c.code).join(', ')}</p>
                <p class="mb-1">Total: ${Utils.formatCurrency(reg.totalFees)}</p>
                ${reg.status === 'approved' ? 
                    '<button class="btn btn-success btn-sm mt-2" onclick="window.location.href=\'dashboard.html?tab=payments\'">Proceed to Payment</button>' : 
                    '<span class="badge bg-warning">Awaiting Approval</span>'}
            </div>
        `;
    }

    function renderRecentRegistrations() {
        const registrations = Data.getRegistrations().slice(0, 5);
        const users = Data.getUsers();

        if (registrations.length === 0) {
            return '<p class="text-muted">No registrations</p>';
        }

        return `
            <table class="table table-sm">
                <tbody>
                    ${registrations.map(reg => {
                        const student = users.find(u => u.id === reg.studentId);
                        return `
                            <tr>
                                <td>${student ? student.firstName : 'Unknown'}</td>
                                <td>${Utils.formatDate(reg.createdAt)}</td>
                                <td><span class="badge bg-${reg.status === 'approved' ? 'success' : 'warning'}">${reg.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    function renderAllRecentPayments() {
        const payments = Data.getPayments().slice(0, 5);
        const users = Data.getUsers();

        if (payments.length === 0) {
            return '<p class="text-muted">No payments</p>';
        }

        return `
            <table class="table table-sm">
                <tbody>
                    ${payments.map(p => {
                        const student = users.find(u => u.id === p.studentId);
                        return `
                            <tr>
                                <td>${student ? student.firstName : 'Unknown'}</td>
                                <td>${Utils.formatCurrency(p.amount)}</td>
                                <td><span class="badge bg-${p.status === 'completed' ? 'success' : 'warning'}">${p.status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // ==================== ACTION HANDLERS ====================

    /**
     * Select course for registration
     */
    function selectCourse(courseId) {
        // Implementation would store selected courses in session
        Utils.showToast('Course selected', 'success');
    }

    /**
     * Process payment
     */
    function processPayment() {
        const checkboxes = document.querySelectorAll('.payment-checkbox:checked');
        if (checkboxes.length === 0) {
            Utils.showToast('Please select items to pay', 'warning');
            return;
        }

        const total = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.amount), 0);
        const user = Auth.getCurrentUser();

        Utils.showLoading('Initializing payment...');

        // Create payment record
        const payment = Data.createPayment({
            studentId: user.id,
            amount: total,
            description: 'Tuition Payment',
            method: document.getElementById('paymentMethod').value
        });

        // Simulate payment processing
        setTimeout(() => {
            Data.updatePaymentStatus(payment.id, 'completed', {
                transactionId: 'TXN' + Date.now()
            });
            
            Utils.hideLoading();
            Utils.showToast('Payment successful!', 'success');
            
            // Reload page
            loadPageContent();
        }, 3000);
    }

    /**
     * Add new course (admin)
     */
    function showAddCourseModal() {
        // Implementation would show modal form
        Utils.showToast('Add course feature', 'info');
    }

    /**
     * Edit course (admin)
     */
    function editCourse(courseId) {
        Utils.showToast('Edit course feature', 'info');
    }

    /**
     * Delete course (admin)
     */
    function deleteCourse(courseId) {
        Utils.confirm('Are you sure you want to delete this course?').then(confirmed => {
            if (confirmed) {
                Data.deleteCourse(courseId);
                Utils.showToast('Course deleted', 'success');
                loadCourseManagement(document.getElementById('dashboardContent'));
            }
        });
    }

    /**
     * Approve registration (admin)
     */
    function approveRegistration(registrationId) {
        Data.updateRegistrationStatus(registrationId, 'approved');
        
        // Update student status
        const reg = Data.getRegistrations().find(r => r.id === registrationId);
        if (reg) {
            Data.updateUser(reg.studentId, { status: 'active' });
        }
        
        Utils.showToast('Registration approved', 'success');
        loadApprovals(document.getElementById('dashboardContent'));
    }

    /**
     * Reject registration (admin)
     */
    function rejectRegistration(registrationId) {
        Data.updateRegistrationStatus(registrationId, 'rejected');
        Utils.showToast('Registration rejected', 'warning');
        loadApprovals(document.getElementById('dashboardContent'));
    }

    /**
     * Update total amount on payment page
     */
    function updateTotalAmount() {
        const checkboxes = document.querySelectorAll('.payment-checkbox:checked');
        const total = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.amount), 0);
        document.getElementById('totalAmount').textContent = Utils.formatCurrency(total);
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        selectCourse,
        processPayment,
        showAddCourseModal,
        editCourse,
        deleteCourse,
        approveRegistration,
        rejectRegistration
    };
})();

// Make app globally available
window.App = App;