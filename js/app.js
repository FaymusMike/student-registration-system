/**
 * UniPortal - Enhanced Application Module
 * Complete admin dashboard with approval workflow
 */

const App = (function() {
    // ==================== STATE MANAGEMENT ====================
    let currentUser = null;
    let notifications = [];
    let pendingCount = 0;

    // ==================== INITIALIZATION ====================

    function init() {
        currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        setupEventListeners();
        checkTheme();
        loadPageContent();
        loadNotifications();
        
        // Auto-refresh pending count every 30 seconds
        if (currentUser.role === 'admin') {
            setInterval(checkPendingApprovals, 30000);
        }
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

        // Notification bell
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            notificationBell.addEventListener('click', loadNotifications);
        }
    }

    // ==================== NOTIFICATION SYSTEM ====================

    /**
     * Load notifications based on user role
     */
    function loadNotifications() {
        if (currentUser.role === 'admin') {
            loadAdminNotifications();
        } else {
            loadStudentNotifications();
        }
    }

    /**
     * Load admin notifications (pending approvals, payments, etc.)
     */
    function loadAdminNotifications() {
        const pendingRegistrations = Data.getRegistrations({ status: 'pending' });
        const pendingStudents = Data.getUsers().filter(u => u.role === 'student' && u.status === 'pending');
        const recentPayments = Data.getPayments({ status: 'completed' }).slice(0, 5);
        
        pendingCount = pendingRegistrations.length + pendingStudents.length;
        
        // Update badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = pendingCount;
            badge.style.display = pendingCount > 0 ? 'inline' : 'none';
        }

        // Build notification list
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        let html = '';

        if (pendingRegistrations.length > 0) {
            html += `
                <div class="notification-item p-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon bg-warning text-white rounded-circle p-2 me-2">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-muted">Just now</small>
                            <p class="mb-0 fw-bold">${pendingRegistrations.length} pending registrations</p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (pendingStudents.length > 0) {
            html += `
                <div class="notification-item p-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon bg-info text-white rounded-circle p-2 me-2">
                            <i class="fas fa-user-clock"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-muted">${Utils.formatDate(new Date())}</small>
                            <p class="mb-0 fw-bold">${pendingStudents.length} new students pending</p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (recentPayments.length > 0) {
            html += `
                <div class="notification-item p-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon bg-success text-white rounded-circle p-2 me-2">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-muted">Recent</small>
                            <p class="mb-0 fw-bold">${recentPayments.length} new payments</p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (html === '') {
            html = '<div class="text-center text-muted p-3">No new notifications</div>';
        }

        notificationList.innerHTML = html;
    }

    /**
     * Load student notifications
     */
    function loadStudentNotifications() {
        const registrations = Data.getRegistrations({ studentId: currentUser.id });
        const pendingReg = registrations.filter(r => r.status === 'pending').length;
        const payments = Data.getPayments({ studentId: currentUser.id, status: 'completed' });
        
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        let html = '';

        if (pendingReg > 0) {
            html += `
                <div class="notification-item p-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon bg-warning text-white rounded-circle p-2 me-2">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-muted">Pending</small>
                            <p class="mb-0 fw-bold">Your registration is awaiting approval</p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (payments.length > 0) {
            html += `
                <div class="notification-item p-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <div class="notification-icon bg-success text-white rounded-circle p-2 me-2">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-muted">${Utils.formatDate(payments[0].createdAt)}</small>
                            <p class="mb-0 fw-bold">Payment of ${Utils.formatCurrency(payments[0].amount)} confirmed</p>
                        </div>
                    </div>
                </div>
            `;
        }

        if (html === '') {
            html = '<div class="text-center text-muted p-3">No new notifications</div>';
        }

        notificationList.innerHTML = html;
    }

    /**
     * Mark all notifications as read
     */
    function markAllNotificationsRead() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.style.display = 'none';
        }
        Utils.showToast('Notifications marked as read', 'success');
    }

    /**
     * Check pending approvals count (for admin)
     */
    function checkPendingApprovals() {
        const pendingRegistrations = Data.getRegistrations({ status: 'pending' });
        const pendingStudents = Data.getUsers().filter(u => u.role === 'student' && u.status === 'pending');
        const newCount = pendingRegistrations.length + pendingStudents.length;

        if (newCount > pendingCount) {
            Utils.showToast(`${newCount - pendingCount} new pending approvals`, 'info');
            loadAdminNotifications();
        }
        
        pendingCount = newCount;
    }

    // ==================== THEME MANAGEMENT ====================

    function checkTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            updateThemeIcon(true);
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }

    function updateThemeIcon(isDark) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ==================== SIDEBAR MANAGEMENT ====================

    function toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('show');
    }

    function renderSidebar() {
        if (!currentUser) return '';

        const menuItems = currentUser.role === 'admin' ? [
            { icon: 'fa-home', text: 'Dashboard', url: 'dashboard.html' },
            { icon: 'fa-users', text: 'Students', url: 'dashboard.html?tab=students' },
            { icon: 'fa-user-plus', text: 'Pending Approvals', url: 'dashboard.html?tab=approvals', badge: pendingCount },
            { icon: 'fa-book', text: 'Courses', url: 'dashboard.html?tab=courses' },
            { icon: 'fa-credit-card', text: 'Payments', url: 'dashboard.html?tab=payments' },
            { icon: 'fa-chart-bar', text: 'Reports', url: 'dashboard.html?tab=reports' },
            { icon: 'fa-cog', text: 'Settings', url: 'dashboard.html?tab=settings' }
        ] : [
            { icon: 'fa-home', text: 'Dashboard', url: 'dashboard.html' },
            { icon: 'fa-user', text: 'My Profile', url: 'dashboard.html?tab=profile' },
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
                        <img src="${currentUser.avatar}" alt="Avatar" class="rounded-circle me-2" width="40" height="40">
                        <div>
                            <div class="fw-bold">${currentUser.firstName} ${currentUser.lastName}</div>
                            <small class="text-muted">${currentUser.role === 'admin' ? 'Administrator' : 'Student'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-menu">
                    ${menuItems.map(item => `
                        <a href="${item.url}" class="nav-link ${isActive(item.url) ? 'active' : ''}">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.text}</span>
                            ${item.badge ? `<span class="badge bg-danger ms-auto">${item.badge}</span>` : ''}
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

    function isActive(url) {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || '';
        return url.includes(tab);
    }

    // ==================== PAGE LOADING ====================

    function loadPageContent() {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || 'dashboard';

        const container = document.getElementById('dashboardContent');
        if (!container) return;

        if (currentUser.role === 'admin') {
            loadAdminContent(tab, container);
        } else {
            loadStudentContent(tab, container);
        }

        // Update page title
        updatePageTitle(tab);
    }

    function updatePageTitle(tab) {
        const titles = {
            'dashboard': 'Dashboard',
            'students': 'Student Management',
            'approvals': 'Pending Approvals',
            'courses': 'Course Management',
            'payments': 'Payment Management',
            'reports': 'Reports & Analytics',
            'settings': 'Settings',
            'profile': 'My Profile',
            'history': 'Payment History',
            'receipts': 'Receipts'
        };

        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = titles[tab] || 'Dashboard';
        }
    }

    // ==================== ADMIN CONTENT ====================

    function loadAdminContent(tab, container) {
        switch(tab) {
            case 'students':
                loadStudentManagement(container);
                break;
            case 'approvals':
                loadApprovalsPage(container);
                break;
            case 'courses':
                loadCourseManagement(container);
                break;
            case 'payments':
                loadPaymentManagement(container);
                break;
            case 'reports':
                loadReportsPage(container);
                break;
            case 'settings':
                loadAdminSettings(container);
                break;
            default:
                loadAdminDashboard(container);
        }
    }

    /**
     * Admin Dashboard Home
     */
    function loadAdminDashboard(container) {
        const stats = Data.getDashboardStats();
        const recentRegistrations = Data.getRegistrations().slice(0, 5);
        const recentPayments = Data.getPayments().slice(0, 5);
        const users = Data.getUsers();

        container.innerHTML = `
            <div class="fade-in">
                <!-- Welcome Banner -->
                <div class="alert alert-primary d-flex align-items-center mb-4">
                    <i class="fas fa-info-circle fa-2x me-3"></i>
                    <div>
                        <h5 class="mb-1">Welcome back, ${currentUser.firstName}!</h5>
                        <p class="mb-0">You have ${stats.pendingRegistrations} pending approvals and ${stats.pendingStudents} new students to review.</p>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Students</h6>
                                    <h3 class="text-white">${stats.totalStudents}</h3>
                                    <small class="text-white-50">+${stats.newStudents || 0} this month</small>
                                </div>
                                <i class="fas fa-users stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #198754, #0f5132);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Revenue</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(stats.totalRevenue)}</h3>
                                    <small class="text-white-50">${stats.paymentGrowth || 0}% growth</small>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #997404);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Pending Approvals</h6>
                                    <h3 class="text-white">${stats.pendingRegistrations}</h3>
                                    <small class="text-white-50">${stats.pendingStudents} new students</small>
                                </div>
                                <i class="fas fa-clock stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #087990);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Active Courses</h6>
                                    <h3 class="text-white">${stats.totalCourses}</h3>
                                    <small class="text-white-50">${stats.activeCourses || stats.totalCourses} available</small>
                                </div>
                                <i class="fas fa-book stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="row g-4 mb-4">
                    <div class="col-lg-8">
                        <div class="table-container">
                            <h5 class="mb-3">Revenue Overview</h5>
                            <canvas id="revenueChart" style="height: 300px;"></canvas>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="table-container">
                            <h5 class="mb-3">Quick Actions</h5>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center" onclick="window.location.href='dashboard.html?tab=approvals'">
                                    <i class="fas fa-user-plus text-primary me-3"></i>
                                    <div>
                                        <h6 class="mb-0">Review Pending Approvals</h6>
                                        <small class="text-muted">${stats.pendingRegistrations} pending</small>
                                    </div>
                                    <i class="fas fa-chevron-right ms-auto"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center" onclick="window.location.href='dashboard.html?tab=courses'">
                                    <i class="fas fa-book text-success me-3"></i>
                                    <div>
                                        <h6 class="mb-0">Manage Courses</h6>
                                        <small class="text-muted">Add or edit courses</small>
                                    </div>
                                    <i class="fas fa-chevron-right ms-auto"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center" onclick="window.location.href='dashboard.html?tab=payments'">
                                    <i class="fas fa-credit-card text-warning me-3"></i>
                                    <div>
                                        <h6 class="mb-0">View Payments</h6>
                                        <small class="text-muted">${stats.completedPayments || 0} completed</small>
                                    </div>
                                    <i class="fas fa-chevron-right ms-auto"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center" onclick="window.location.href='dashboard.html?tab=reports'">
                                    <i class="fas fa-chart-bar text-info me-3"></i>
                                    <div>
                                        <h6 class="mb-0">Generate Reports</h6>
                                        <small class="text-muted">Export data</small>
                                    </div>
                                    <i class="fas fa-chevron-right ms-auto"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity Tables -->
                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="table-container">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Pending Registrations</h5>
                                <a href="dashboard.html?tab=approvals" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            ${renderPendingRegistrationsTable(recentRegistrations.filter(r => r.status === 'pending'))}
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="table-container">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Recent Payments</h5>
                                <a href="dashboard.html?tab=payments" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            ${renderRecentPaymentsTable(recentPayments)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        setTimeout(() => {
            initializeCharts();
        }, 100);
    }

    /**
     * Student Management Page
     */
    function loadStudentManagement(container) {
        const students = Data.getUsers().filter(u => u.role === 'student');
        const registrations = Data.getRegistrations();

        container.innerHTML = `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Student Management</h2>
                    <div>
                        <button class="btn btn-success me-2" onclick="App.exportStudents()">
                            <i class="fas fa-file-excel me-2"></i>Export
                        </button>
                        <button class="btn btn-primary" onclick="App.sendBulkEmail()">
                            <i class="fas fa-envelope me-2"></i>Bulk Email
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <input type="text" class="form-control" id="searchStudent" placeholder="Search students...">
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="filterStatus">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="filterDepartment">
                            <option value="">All Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-primary w-100" onclick="App.filterStudents()">
                            <i class="fas fa-filter me-2"></i>Apply
                        </button>
                    </div>
                </div>

                <!-- Students Table -->
                <div class="table-container">
                    <table class="table table-hover" id="studentsTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => {
                                const studentRegs = registrations.filter(r => r.studentId === student.id);
                                const statusClass = {
                                    'active': 'success',
                                    'pending': 'warning',
                                    'suspended': 'danger'
                                }[student.status] || 'secondary';

                                return `
                                    <tr>
                                        <td><small>${student.id}</small></td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${student.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                                <div>
                                                    <strong>${student.firstName} ${student.lastName}</strong>
                                                    <br>
                                                    <small class="text-muted">${studentRegs.length} registrations</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${student.email}</td>
                                        <td>${student.department || 'Not set'}</td>
                                        <td>
                                            <span class="badge bg-${statusClass}">${student.status}</span>
                                        </td>
                                        <td>${Utils.formatDate(student.createdAt)}</td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-info" onclick="App.viewStudent('${student.id}')">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-warning" onclick="App.editStudent('${student.id}')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-${student.status === 'active' ? 'danger' : 'success'}" 
                                                        onclick="App.toggleStudentStatus('${student.id}')">
                                                    <i class="fas fa-${student.status === 'active' ? 'ban' : 'check'}"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize DataTable
        setTimeout(() => {
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                $('#studentsTable').DataTable({
                    pageLength: 10,
                    responsive: true,
                    searching: true,
                    ordering: true
                });
            }
        }, 100);
    }

    /**
     * Approvals Page - Enhanced with complete workflow
     */
    function loadApprovalsPage(container) {
        const pendingRegistrations = Data.getRegistrations({ status: 'pending' });
        const pendingStudents = Data.getUsers().filter(u => u.role === 'student' && u.status === 'pending');
        const users = Data.getUsers();
        const courses = Data.getCourses();

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Pending Approvals</h2>

                <!-- Summary Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #997404);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">Pending Registrations</h6>
                                    <h2 class="text-white">${pendingRegistrations.length}</h2>
                                </div>
                                <i class="fas fa-clock fa-3x stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #087990);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">New Students</h6>
                                    <h2 class="text-white">${pendingStudents.length}</h2>
                                </div>
                                <i class="fas fa-user-plus fa-3x stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <ul class="nav nav-tabs mb-4" id="approvalTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="registrations-tab" data-bs-toggle="tab" data-bs-target="#registrations" type="button" role="tab">
                            Course Registrations
                            ${pendingRegistrations.length > 0 ? `<span class="badge bg-danger ms-2">${pendingRegistrations.length}</span>` : ''}
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="students-tab" data-bs-toggle="tab" data-bs-target="#students" type="button" role="tab">
                            New Students
                            ${pendingStudents.length > 0 ? `<span class="badge bg-danger ms-2">${pendingStudents.length}</span>` : ''}
                        </button>
                    </li>
                </ul>

                <div class="tab-content" id="approvalTabContent">
                    <!-- Registrations Tab -->
                    <div class="tab-pane fade show active" id="registrations" role="tabpanel">
                        <div class="table-container">
                            <table class="table table-hover" id="registrationsTable">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>Courses</th>
                                        <th>Total Fee</th>
                                        <th>Credits</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendingRegistrations.map(reg => {
                                        const student = users.find(u => u.id === reg.studentId);
                                        if (!student) return '';

                                        const selectedCourses = courses.filter(c => reg.courses.includes(c.id));
                                        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);

                                        return `
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <img src="${student.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                                        <div>
                                                            <strong>${student.firstName} ${student.lastName}</strong>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>${student.email}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-link" onclick="App.viewCourses('${reg.id}')">
                                                        ${selectedCourses.length} courses
                                                    </button>
                                                </td>
                                                <td><strong>${Utils.formatCurrency(reg.totalFees)}</strong></td>
                                                <td>${totalCredits}</td>
                                                <td>${Utils.formatDate(reg.createdAt)}</td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-success" onclick="App.showApproveModal('${reg.id}')">
                                                            <i class="fas fa-check"></i> Approve
                                                        </button>
                                                        <button class="btn btn-sm btn-danger" onclick="App.showRejectModal('${reg.id}')">
                                                            <i class="fas fa-times"></i> Reject
                                                        </button>
                                                        <button class="btn btn-sm btn-info" onclick="App.viewRegistrationDetails('${reg.id}')">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Students Tab -->
                    <div class="tab-pane fade" id="students" role="tabpanel">
                        <div class="table-container">
                            <table class="table table-hover" id="studentsTable">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Location</th>
                                        <th>Registered</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendingStudents.map(student => `
                                        <tr>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img src="${student.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                                    <div>
                                                        <strong>${student.firstName} ${student.lastName}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${student.email}</td>
                                            <td>${student.phone || 'N/A'}</td>
                                            <td>${student.location || 'N/A'}</td>
                                            <td>${Utils.formatDate(student.createdAt)}</td>
                                            <td>
                                                <div class="btn-group">
                                                    <button class="btn btn-sm btn-success" onclick="App.approveStudent('${student.id}')">
                                                        <i class="fas fa-check"></i> Approve
                                                    </button>
                                                    <button class="btn btn-sm btn-danger" onclick="App.rejectStudent('${student.id}')">
                                                        <i class="fas fa-times"></i> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize DataTables
        setTimeout(() => {
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                $('#registrationsTable').DataTable({
                    pageLength: 10,
                    order: [[5, 'desc']]
                });
                $('#studentsTable').DataTable({
                    pageLength: 10,
                    order: [[4, 'desc']]
                });
            }
        }, 100);
    }

    /**
     * Course Management Page
     */
    function loadCourseManagement(container) {
        const courses = Data.getCourses();

        container.innerHTML = `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Course Management</h2>
                    <button class="btn btn-primary" onclick="App.showAddCourseModal()">
                        <i class="fas fa-plus me-2"></i>Add New Course
                    </button>
                </div>

                <!-- Course Stats -->
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Total Courses</h6>
                                <h3>${courses.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Total Credits</h6>
                                <h3>${courses.reduce((sum, c) => sum + c.credits, 0)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Avg Fee</h6>
                                <h3>${Utils.formatCurrency(courses.reduce((sum, c) => sum + c.fee, 0) / courses.length)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Departments</h6>
                                <h3>${new Set(courses.map(c => c.department)).size}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Courses Table -->
                <div class="table-container">
                    <table class="table table-hover" id="coursesTable">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Title</th>
                                <th>Credits</th>
                                <th>Fee</th>
                                <th>Department</th>
                                <th>Instructor</th>
                                <th>Schedule</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courses.map(course => `
                                <tr>
                                    <td><strong>${course.code}</strong></td>
                                    <td>${course.title}</td>
                                    <td><span class="badge bg-primary">${course.credits}</span></td>
                                    <td>${Utils.formatCurrency(course.fee)}</td>
                                    <td>${course.department}</td>
                                    <td>${course.instructor || 'TBA'}</td>
                                    <td>${course.schedule || 'TBA'}</td>
                                    <td>
                                        <span class="badge bg-${course.available ? 'success' : 'danger'}">
                                            ${course.available ? 'Available' : 'Full'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-warning" onclick="App.editCourse('${course.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="App.deleteCourse('${course.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="App.viewCourseDetails('${course.id}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize DataTable
        setTimeout(() => {
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                $('#coursesTable').DataTable({
                    pageLength: 10,
                    order: [[0, 'asc']]
                });
            }
        }, 100);
    }

    /**
     * Payment Management Page
     */
    function loadPaymentManagement(container) {
        const payments = Data.getPayments();
        const users = Data.getUsers();

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Payment Management</h2>

                <!-- Payment Stats -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #198754, #0f5132);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Revenue</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}</h3>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #087990);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Transactions</h6>
                                    <h3 class="text-white">${payments.length}</h3>
                                </div>
                                <i class="fas fa-credit-card stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #997404);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Success Rate</h6>
                                    <h3 class="text-white">${((payments.filter(p => p.status === 'completed').length / payments.length) * 100).toFixed(1)}%</h3>
                                </div>
                                <i class="fas fa-chart-line stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payments Table -->
                <div class="table-container">
                    <table class="table table-hover" id="paymentsTable">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Student</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(payment => {
                                const student = users.find(u => u.id === payment.studentId);
                                return `
                                    <tr>
                                        <td><small>${payment.id}</small></td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${student?.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                                <div>
                                                    <strong>${student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${payment.description || 'Tuition Payment'}</td>
                                        <td><strong>${Utils.formatCurrency(payment.amount)}</strong></td>
                                        <td><span class="badge bg-secondary">${payment.method || 'Paystack'}</span></td>
                                        <td>${Utils.formatDate(payment.createdAt)}</td>
                                        <td>
                                            <span class="badge bg-${payment.status === 'completed' ? 'success' : 
                                                                   payment.status === 'pending' ? 'warning' : 'danger'}">
                                                ${payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group">
                                                <button class="btn btn-sm btn-info" onclick="App.viewPaymentDetails('${payment.id}')">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-success" onclick="App.downloadReceipt('${payment.id}')">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize DataTable
        setTimeout(() => {
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                $('#paymentsTable').DataTable({
                    pageLength: 10,
                    order: [[5, 'desc']]
                });
            }
        }, 100);
    }

    /**
     * Reports Page
     */
    function loadReportsPage(container) {
        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Reports & Analytics</h2>

                <!-- Report Filters -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <label class="form-label">Start Date</label>
                        <input type="date" class="form-control" id="reportStartDate">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-control" id="reportEndDate">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Report Type</label>
                        <select class="form-select" id="reportType">
                            <option value="financial">Financial Report</option>
                            <option value="enrollment">Enrollment Report</option>
                            <option value="student">Student Report</option>
                            <option value="course">Course Report</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Format</label>
                        <select class="form-select" id="reportFormat">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                        </select>
                    </div>
                </div>

                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <button class="btn btn-primary w-100" onclick="App.generateReport()">
                            <i class="fas fa-file-export me-2"></i>Generate Report
                        </button>
                    </div>
                    <div class="col-md-6">
                        <button class="btn btn-success w-100" onclick="App.scheduleReport()">
                            <i class="fas fa-clock me-2"></i>Schedule Report
                        </button>
                    </div>
                </div>

                <!-- Report Cards -->
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Available Reports</h5>
                            </div>
                            <div class="list-group list-group-flush">
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onclick="App.downloadReport('financial')">
                                    <div>
                                        <i class="fas fa-dollar-sign text-success me-2"></i>
                                        Financial Summary
                                    </div>
                                    <span class="badge bg-primary">Monthly</span>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onclick="App.downloadReport('enrollment')">
                                    <div>
                                        <i class="fas fa-users text-info me-2"></i>
                                        Enrollment Statistics
                                    </div>
                                    <span class="badge bg-primary">Weekly</span>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onclick="App.downloadReport('courses')">
                                    <div>
                                        <i class="fas fa-book text-warning me-2"></i>
                                        Course Popularity
                                    </div>
                                    <span class="badge bg-primary">Monthly</span>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onclick="App.downloadReport('payments')">
                                    <div>
                                        <i class="fas fa-credit-card text-danger me-2"></i>
                                        Payment Analysis
                                    </div>
                                    <span class="badge bg-primary">Daily</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Scheduled Reports</h5>
                            </div>
                            <div class="list-group list-group-flush">
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="fas fa-clock text-primary me-2"></i>
                                            <strong>Financial Report</strong>
                                            <br>
                                            <small class="text-muted">Every Monday at 9:00 AM</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i class="fas fa-clock text-primary me-2"></i>
                                            <strong>Enrollment Report</strong>
                                            <br>
                                            <small class="text-muted">Every Friday at 5:00 PM</small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== RENDER HELPERS ====================

    function renderPendingRegistrationsTable(registrations) {
        if (registrations.length === 0) {
            return '<p class="text-muted text-center py-3">No pending registrations</p>';
        }

        const users = Data.getUsers();
        const courses = Data.getCourses();

        return `
            <table class="table table-sm">
                <tbody>
                    ${registrations.map(reg => {
                        const student = users.find(u => u.id === reg.studentId);
                        const courseCount = reg.courses.length;
                        return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="${student?.avatar}" alt="" class="rounded-circle me-2" width="25" height="25">
                                        <div>
                                            <strong>${student?.firstName} ${student?.lastName}</strong>
                                            <br>
                                            <small class="text-muted">${courseCount} courses</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${Utils.formatCurrency(reg.totalFees)}</td>
                                <td>
                                    <button class="btn btn-sm btn-success" onclick="App.showApproveModal('${reg.id}')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    function renderRecentPaymentsTable(payments) {
        if (payments.length === 0) {
            return '<p class="text-muted text-center py-3">No recent payments</p>';
        }

        const users = Data.getUsers();

        return `
            <table class="table table-sm">
                <tbody>
                    ${payments.map(payment => {
                        const student = users.find(u => u.id === payment.studentId);
                        return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="${student?.avatar}" alt="" class="rounded-circle me-2" width="25" height="25">
                                        <div>
                                            <strong>${student?.firstName} ${student?.lastName}</strong>
                                            <br>
                                            <small class="text-muted">${Utils.formatDate(payment.createdAt)}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${Utils.formatCurrency(payment.amount)}</td>
                                <td>
                                    <span class="badge bg-success">${payment.status}</span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // ==================== ACTION HANDLERS ====================

    /**
     * Show approve modal
     */
    function showApproveModal(registrationId) {
        const registration = Data.getRegistrations().find(r => r.id === registrationId);
        if (!registration) return;

        const user = Data.getUserById(registration.studentId);
        const courses = Data.getCourses().filter(c => registration.courses.includes(c.id));

        const details = document.getElementById('approvalDetails');
        details.innerHTML = `
            <p class="mb-1"><strong>Student:</strong> ${user?.firstName} ${user?.lastName}</p>
            <p class="mb-1"><strong>Email:</strong> ${user?.email}</p>
            <p class="mb-1"><strong>Courses:</strong> ${courses.map(c => c.code).join(', ')}</p>
            <p class="mb-0"><strong>Total Fee:</strong> ${Utils.formatCurrency(registration.totalFees)}</p>
        `;

        document.getElementById('confirmApproveBtn').setAttribute('data-registration', registrationId);
        
        const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
        modal.show();
    }

    /**
     * Approve registration
     */
    function approveRegistration(registrationId) {
        // Update registration status
        Data.updateRegistrationStatus(registrationId, 'approved');
        
        // Get registration details
        const registration = Data.getRegistrations().find(r => r.id === registrationId);
        if (registration) {
            // Update student status to active
            Data.updateUser(registration.studentId, { status: 'active' });
            
            // Create notification in session
            Utils.showToast('Registration approved successfully!', 'success');
            
            // Create payment record
            Data.createPayment({
                studentId: registration.studentId,
                amount: registration.totalFees,
                description: 'Course Registration Fee',
                method: 'Pending',
                status: 'pending'
            });
        }

        // Refresh page
        loadApprovalsPage(document.getElementById('dashboardContent'));
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
    }

    /**
     * Show reject modal
     */
    function showRejectModal(registrationId) {
        document.getElementById('confirmRejectBtn').setAttribute('data-registration', registrationId);
        new bootstrap.Modal(document.getElementById('rejectModal')).show();
    }

    /**
     * Reject registration
     */
    function rejectRegistration(registrationId) {
        const reason = document.getElementById('rejectReason').value;
        
        Data.updateRegistrationStatus(registrationId, 'rejected');
        
        Utils.showToast('Registration rejected', 'warning');
        
        loadApprovalsPage(document.getElementById('dashboardContent'));
        bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
    }

    /**
     * Approve student
     */
    function approveStudent(studentId) {
        Data.updateUser(studentId, { status: 'active' });
        Utils.showToast('Student approved successfully', 'success');
        loadApprovalsPage(document.getElementById('dashboardContent'));
    }

    /**
     * Reject student
     */
    function rejectStudent(studentId) {
        Data.updateUser(studentId, { status: 'rejected' });
        Utils.showToast('Student rejected', 'warning');
        loadApprovalsPage(document.getElementById('dashboardContent'));
    }

    /**
     * Toggle student status
     */
    function toggleStudentStatus(studentId) {
        const student = Data.getUserById(studentId);
        const newStatus = student.status === 'active' ? 'suspended' : 'active';
        
        Data.updateUser(studentId, { status: newStatus });
        Utils.showToast(`Student ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success');
        
        loadStudentManagement(document.getElementById('dashboardContent'));
    }

    /**
     * Export students to Excel
     */
    function exportStudents() {
        const students = Data.getUsers().filter(u => u.role === 'student');
        
        const exportData = students.map(s => ({
            'Student ID': s.id,
            'First Name': s.firstName,
            'Last Name': s.lastName,
            'Email': s.email,
            'Phone': s.phone || '',
            'Department': s.department || '',
            'Status': s.status,
            'Joined': Utils.formatDate(s.createdAt)
        }));
        
        Utils.exportToExcel(exportData, 'students_list');
        Utils.showToast('Students exported successfully', 'success');
    }

    /**
     * Show add course modal
     */
    function showAddCourseModal() {
        const modalHtml = `
            <div class="modal fade" id="courseModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-plus-circle me-2"></i>Add New Course
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="courseForm">
                                <div class="mb-3">
                                    <label class="form-label">Course Code</label>
                                    <input type="text" class="form-control" id="courseCode" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Course Title</label>
                                    <input type="text" class="form-control" id="courseTitle" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Credit Units</label>
                                    <input type="number" class="form-control" id="courseCredits" min="1" max="6" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Course Fee ($)</label>
                                    <input type="number" class="form-control" id="courseFee" min="0" step="0.01" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Department</label>
                                    <select class="form-select" id="courseDepartment" required>
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Biology">Biology</option>
                                        <option value="Engineering">Engineering</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Instructor</label>
                                    <input type="text" class="form-control" id="courseInstructor" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Schedule</label>
                                    <input type="text" class="form-control" id="courseSchedule" placeholder="e.g., Mon/Wed 10:00-11:30" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="courseDescription" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="App.saveCourse()">
                                <i class="fas fa-save me-2"></i>Save Course
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('courseModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('courseModal')).show();
    }

    /**
     * Save course
     */
    function saveCourse() {
        const courseData = {
            code: document.getElementById('courseCode').value,
            title: document.getElementById('courseTitle').value,
            credits: parseInt(document.getElementById('courseCredits').value),
            fee: parseFloat(document.getElementById('courseFee').value),
            department: document.getElementById('courseDepartment').value,
            instructor: document.getElementById('courseInstructor').value,
            schedule: document.getElementById('courseSchedule').value,
            description: document.getElementById('courseDescription').value,
            available: true
        };

        Data.addCourse(courseData);
        Utils.showToast('Course added successfully', 'success');
        
        bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
        loadCourseManagement(document.getElementById('dashboardContent'));
    }

    /**
     * Edit course
     */
    function editCourse(courseId) {
        Utils.showToast('Edit course feature coming soon', 'info');
    }

    /**
     * Delete course
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
     * Initialize charts
     */
    function initializeCharts() {
        const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
        if (!revenueCtx) return;

        // Generate last 6 months labels
        const months = [];
        const revenue = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('default', { month: 'short' }));
            
            // Generate random revenue data (replace with real data)
            revenue.push(Math.floor(Math.random() * 50000) + 20000);
        }

        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenue,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Generate report
     */
    function generateReport() {
        const startDate = document.getElementById('reportStartDate')?.value;
        const endDate = document.getElementById('reportEndDate')?.value;
        const type = document.getElementById('reportType')?.value;
        
        Utils.showToast(`Generating ${type} report...`, 'info');
        
        setTimeout(() => {
            Utils.showToast('Report generated successfully', 'success');
        }, 2000);
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        renderSidebar,
        loadNotifications,
        markAllNotificationsRead,
        
        // Approval actions
        showApproveModal,
        approveRegistration: approveRegistration,
        showRejectModal,
        rejectRegistration: rejectRegistration,
        approveStudent,
        rejectStudent,
        
        // Student actions
        toggleStudentStatus,
        exportStudents,
        viewStudent: (id) => Utils.showToast('View student details', 'info'),
        editStudent: (id) => Utils.showToast('Edit student', 'info'),
        
        // Course actions
        showAddCourseModal,
        saveCourse,
        editCourse,
        deleteCourse,
        viewCourseDetails: (id) => Utils.showToast('View course details', 'info'),
        
        // Payment actions
        viewPaymentDetails: (id) => Utils.showToast('View payment details', 'info'),
        downloadReceipt: (id) => Utils.showToast('Download receipt', 'info'),
        
        // Report actions
        generateReport,
        scheduleReport: () => Utils.showToast('Schedule report', 'info'),
        downloadReport: (type) => Utils.showToast(`Downloading ${type} report`, 'info'),
        
        // Other
        filterStudents: () => Utils.showToast('Filtering students', 'info'),
        sendBulkEmail: () => Utils.showToast('Bulk email feature', 'info'),
        viewRegistrationDetails: (id) => Utils.showToast('View registration details', 'info'),
        viewCourses: (id) => Utils.showToast('View courses', 'info')
    };
})();

// Make app globally available
window.App = App;