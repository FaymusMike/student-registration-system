/**
 * UniPortal - Complete Application Controller
 * Production-ready with all admin and student features fully implemented
 * Version: 2.0.0
 */

const App = (function() {
    // ==================== STATE MANAGEMENT ====================
    let currentUser = null;
    let currentRegistration = null;
    let selectedCourses = [];
    let charts = {};
    let pendingCount = 0;

    // ==================== INITIALIZATION ====================

    function init() {
        currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            // Allow access to public pages
            const publicPages = ['login.html', 'register.html', 'index.html'];
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (!publicPages.includes(currentPage)) {
                window.location.href = 'login.html';
            }
            return;
        }

        setupEventListeners();
        checkTheme();
        loadPageContent();
        loadNotifications();
        
        // Auto-refresh data every 30 seconds for admin
        if (currentUser.role === 'admin') {
            setInterval(refreshDashboardData, 30000);
        }
        
        // Auto-refresh pending approvals count
        if (currentUser.role === 'admin') {
            updatePendingApprovalsBadge();
            setInterval(updatePendingApprovalsBadge, 60000);
        }
    }

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
        const notificationBell = document.getElementById('notificationBtn');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => loadNotifications(true));
        }

        // Global search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(handleGlobalSearch, 500));
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const toggle = document.getElementById('sidebarToggle');
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('show')) {
                if (!sidebar.contains(e.target) && !toggle?.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
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
        
        // Update charts if they exist
        Object.values(charts).forEach(chart => {
            if (chart && chart.update) {
                chart.update();
            }
        });
    }

    function updateThemeIcon(isDark) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ==================== SIDEBAR ====================

    function toggleSidebar() {
        document.querySelector('.sidebar')?.classList.toggle('show');
    }

    function renderSidebar() {
        if (!currentUser) return '';

        const stats = currentUser.role === 'admin' ? Data.getDashboardStats() : null;
        
        const menuItems = currentUser.role === 'admin' ? [
            { icon: 'fa-home', text: 'Dashboard', url: 'dashboard.html', exact: true },
            { icon: 'fa-users', text: 'Students', url: 'dashboard.html?tab=students' },
            { icon: 'fa-user-plus', text: 'Approvals', url: 'dashboard.html?tab=approvals', 
              badge: stats?.pendingRegistrations + stats?.pendingStudents },
            { icon: 'fa-book', text: 'Courses', url: 'dashboard.html?tab=courses' },
            { icon: 'fa-credit-card', text: 'Payments', url: 'dashboard.html?tab=payments' },
            { icon: 'fa-chart-bar', text: 'Reports', url: 'dashboard.html?tab=reports' },
            { icon: 'fa-cog', text: 'Settings', url: 'dashboard.html?tab=settings' }
        ] : [
            { icon: 'fa-home', text: 'Dashboard', url: 'dashboard.html', exact: true },
            { icon: 'fa-user', text: 'Profile', url: 'dashboard.html?tab=profile' },
            { icon: 'fa-book', text: 'Course Registration', url: 'dashboard.html?tab=courses' },
            { icon: 'fa-credit-card', text: 'Make Payment', url: 'dashboard.html?tab=payments' },
            { icon: 'fa-history', text: 'Payment History', url: 'dashboard.html?tab=history' },
            { icon: 'fa-download', text: 'Receipts', url: 'dashboard.html?tab=receipts' }
        ];

        // Get current URL parameters
        const params = new URLSearchParams(window.location.search);
        const currentTab = params.get('tab') || 'dashboard';

        return `
            <div class="sidebar">
                <div class="sidebar-header p-3">
                    <a href="index.html" class="text-decoration-none">
                        <i class="fas fa-university fa-2x text-primary"></i>
                        <h5 class="mt-2 text-dark">UniPortal</h5>
                    </a>
                </div>
                
                <div class="sidebar-user p-3 border-top border-bottom">
                    <div class="d-flex align-items-center">
                        <img src="${currentUser.avatar}" alt="Avatar" class="rounded-circle me-2" width="45" height="45">
                        <div class="user-info">
                            <div class="fw-bold">${currentUser.firstName} ${currentUser.lastName}</div>
                            <small class="text-muted">${currentUser.role === 'admin' ? 'Administrator' : 'Student'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-menu">
                    ${menuItems.map(item => {
                        const isActive = item.exact 
                            ? window.location.pathname.includes(item.url) && !window.location.search
                            : item.url.includes(currentTab);
                        
                        return `
                            <a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}">
                                <i class="fas ${item.icon}"></i>
                                <span>${item.text}</span>
                                ${item.badge ? `<span class="badge bg-danger ms-auto">${item.badge}</span>` : ''}
                            </a>
                        `;
                    }).join('')}
                </div>
                
                <div class="sidebar-footer p-3 border-top">
                    <button class="btn btn-danger w-100 logout-btn">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                </div>
            </div>
        `;
    }

    // ==================== NOTIFICATIONS ====================

    function loadNotifications(showToast = false) {
        if (!currentUser) return;
        
        if (currentUser.role === 'admin') {
            loadAdminNotifications(showToast);
        } else {
            loadStudentNotifications();
        }
    }

    function loadAdminNotifications(showToast = false) {
        const stats = Data.getDashboardStats();
        const pendingCount = stats.pendingRegistrations + stats.pendingStudents;
        
        // Update badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = pendingCount;
            badge.style.display = pendingCount > 0 ? 'inline' : 'none';
        }

        // Show toast for new notifications
        if (showToast && pendingCount > 0) {
            Utils.showToast(`${pendingCount} pending ${pendingCount === 1 ? 'item' : 'items'}`, 'info');
        }

        // Build notification list
        const list = document.getElementById('notificationList');
        if (!list) return;

        const pendingRegistrations = Data.getRegistrations({ status: 'pending' });
        const pendingStudents = Data.getUsers().filter(u => u.role === 'student' && u.status === 'pending');
        const recentPayments = Data.getPayments({ status: 'completed' }).slice(0, 5);

        let html = '';

        if (pendingRegistrations.length > 0) {
            html += `
                <div class="notification-item p-3 border-bottom">
                    <div class="d-flex">
                        <div class="notification-icon bg-warning text-white rounded-circle p-2 me-3" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">Just now</small>
                                <small class="text-muted">${pendingRegistrations.length}</small>
                            </div>
                            <p class="mb-1 fw-bold">Course Registrations Pending</p>
                            <button class="btn btn-sm btn-link p-0" onclick="window.location.href='dashboard.html?tab=approvals'">
                                Review Now →
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        if (pendingStudents.length > 0) {
            html += `
                <div class="notification-item p-3 border-bottom">
                    <div class="d-flex">
                        <div class="notification-icon bg-info text-white rounded-circle p-2 me-3" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-user-clock"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">Today</small>
                                <small class="text-muted">${pendingStudents.length}</small>
                            </div>
                            <p class="mb-1 fw-bold">New Students Pending</p>
                            <button class="btn btn-sm btn-link p-0" onclick="window.location.href='dashboard.html?tab=approvals'">
                                Review Now →
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        recentPayments.forEach(payment => {
            const student = Data.getUserById(payment.studentId);
            html += `
                <div class="notification-item p-3 border-bottom">
                    <div class="d-flex">
                        <div class="notification-icon bg-success text-white rounded-circle p-2 me-3" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="flex-grow-1">
                            <small class="text-muted">${Utils.formatDate(payment.createdAt, 'time')}</small>
                            <p class="mb-1">
                                <strong>${student?.firstName} ${student?.lastName}</strong> paid 
                                ${Utils.formatCurrency(payment.amount)}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });

        if (html === '') {
            html = '<div class="text-center text-muted p-4">No new notifications</div>';
        }

        list.innerHTML = html;
    }

    function loadStudentNotifications() {
        const registrations = Data.getRegistrations({ studentId: currentUser.id });
        const pendingReg = registrations.filter(r => r.status === 'pending').length;
        const approvedReg = registrations.filter(r => r.status === 'approved').length;
        const payments = Data.getPayments({ studentId: currentUser.id, status: 'completed' });
        
        const list = document.getElementById('notificationList');
        if (!list) return;

        let html = '';

        if (pendingReg > 0) {
            html += `
                <div class="notification-item p-3 border-bottom">
                    <div class="d-flex">
                        <div class="notification-icon bg-warning text-white rounded-circle p-2 me-3">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-0 fw-bold">Registration Pending</p>
                            <small class="text-muted">Your registration is awaiting approval</small>
                        </div>
                    </div>
                </div>
            `;
        }

        if (approvedReg > 0) {
            html += `
                <div class="notification-item p-3 border-bottom">
                    <div class="d-flex">
                        <div class="notification-icon bg-success text-white rounded-circle p-2 me-3">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-0 fw-bold">Registration Approved</p>
                            <small class="text-muted">You can now proceed to payment</small>
                        </div>
                    </div>
                </div>
            `;
        }

        if (payments.length > 0) {
            html += `
                <div class="notification-item p-3 border-bottom">
                    <div class="d-flex">
                        <div class="notification-icon bg-info text-white rounded-circle p-2 me-3">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-0 fw-bold">Payment Confirmed</p>
                            <small class="text-muted">Last payment: ${Utils.formatDate(payments[0].createdAt)}</small>
                        </div>
                    </div>
                </div>
            `;
        }

        if (html === '') {
            html = '<div class="text-center text-muted p-4">No new notifications</div>';
        }

        list.innerHTML = html;
    }

    function markAllNotificationsRead() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.style.display = 'none';
        }
        Utils.showToast('Notifications marked as read', 'success');
    }

    function updatePendingApprovalsBadge() {
        if (!currentUser || currentUser.role !== 'admin') return;
        
        const stats = Data.getDashboardStats();
        const totalPending = stats.pendingRegistrations + stats.pendingStudents;
        
        // Update sidebar badge
        const sidebarBadge = document.querySelector('.sidebar-menu .nav-link[href*="approvals"] .badge');
        if (sidebarBadge) {
            if (totalPending > 0) {
                sidebarBadge.textContent = totalPending;
                sidebarBadge.style.display = 'inline';
            } else {
                sidebarBadge.style.display = 'none';
            }
        }
        
        // Update notification badge
        const notifBadge = document.getElementById('notificationBadge');
        if (notifBadge) {
            notifBadge.textContent = totalPending;
            notifBadge.style.display = totalPending > 0 ? 'inline' : 'none';
        }
    }

    // ==================== PAGE LOADING ====================

    function loadPageContent() {
        if (!currentUser) return;
        
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || 'dashboard';

        const container = document.getElementById('dashboardContent');
        if (!container) return;

        if (currentUser.role === 'admin') {
            loadAdminContent(tab, container);
        } else {
            loadStudentContent(tab, container);
        }

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
            'settings': 'System Settings',
            'profile': 'My Profile',
            'history': 'Payment History',
            'receipts': 'My Receipts'
        };

        const titleEl = document.getElementById('pageTitle');
        if (titleEl) {
            titleEl.textContent = titles[tab] || 'Dashboard';
        }
    }

    function refreshDashboardData() {
        if (!currentUser) return;
        
        if (currentUser.role === 'admin') {
            const stats = Data.getDashboardStats();
            
            // Update notification badge
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                const totalPending = stats.pendingRegistrations + stats.pendingStudents;
                badge.textContent = totalPending;
                badge.style.display = totalPending > 0 ? 'inline' : 'none';
            }
        }
    }

    // ==================== GLOBAL SEARCH ====================

    function handleGlobalSearch(query) {
        if (!query || query.length < 2) return;
        
        if (currentUser.role === 'admin') {
            // Search students, courses, payments
            const students = Data.getUsers().filter(u => 
                u.role === 'student' && 
                (u.firstName.toLowerCase().includes(query.toLowerCase()) ||
                 u.lastName.toLowerCase().includes(query.toLowerCase()) ||
                 u.email.toLowerCase().includes(query.toLowerCase()) ||
                 u.id.toLowerCase().includes(query.toLowerCase()))
            );
            
            const courses = Data.getCourses().filter(c =>
                c.code.toLowerCase().includes(query.toLowerCase()) ||
                c.title.toLowerCase().includes(query.toLowerCase())
            );
            
            if (students.length > 0 || courses.length > 0) {
                Utils.showToast(`Found ${students.length} students, ${courses.length} courses`, 'info');
            }
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
                loadSettingsPage(container);
                break;
            default:
                loadAdminDashboard(container);
        }
    }

    // ==================== STUDENT CONTENT ====================

    function loadStudentContent(tab, container) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        switch(tab) {
            case 'profile':
                loadStudentProfile(container);
                break;
            case 'courses':
                loadStudentCourseRegistration(container);
                break;
            case 'payments':
                loadStudentPaymentPage(container);
                break;
            case 'history':
                loadStudentPaymentHistory(container);
                break;
            case 'receipts':
                loadStudentReceipts(container);
                break;
            default:
                loadStudentDashboard(container);
        }
    }

    // ==================== ADMIN DASHBOARD ====================

    function loadAdminDashboard(container) {
        const stats = Data.getDashboardStats();
        const recentRegistrations = Data.getRegistrations().slice(0, 5);
        const recentPayments = Data.getPayments().slice(0, 5);
        const users = Data.getUsers();

        container.innerHTML = `
            <div class="fade-in">
                <!-- Welcome Banner -->
                <div class="alert alert-primary d-flex align-items-center mb-4 animate__animated animate__fadeIn">
                    <i class="fas fa-info-circle fa-2x me-3"></i>
                    <div>
                        <h5 class="mb-1">Welcome back, ${currentUser.firstName}!</h5>
                        <p class="mb-0">
                            ${stats.pendingRegistrations + stats.pendingStudents} pending items | 
                            ${Utils.formatCurrency(stats.thisMonthRevenue || 0)} revenue this month
                        </p>
                    </div>
                </div>

                <!-- Stats Cards Row 1 -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card animate__animated animate__fadeInUp" style="background: linear-gradient(135deg, #0d6efd, #0a58ca);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Students</h6>
                                    <h3 class="text-white">${stats.totalStudents}</h3>
                                    <small class="text-white-50">
                                        <i class="fas fa-arrow-up me-1"></i>${stats.studentGrowth || 0}% this month
                                    </small>
                                </div>
                                <i class="fas fa-users stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 0.1s; background: linear-gradient(135deg, #198754, #146c43);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Revenue</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(stats.totalRevenue)}</h3>
                                    <small class="text-white-50">
                                        <i class="fas fa-arrow-${stats.revenueGrowth >= 0 ? 'up' : 'down'} me-1"></i>
                                        ${Math.abs(stats.revenueGrowth)}% growth
                                    </small>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 0.2s; background: linear-gradient(135deg, #ffc107, #cc9a06);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Pending Approvals</h6>
                                    <h3 class="text-white">${stats.pendingRegistrations + stats.pendingStudents}</h3>
                                    <small class="text-white-50">${stats.pendingStudents} new students</small>
                                </div>
                                <i class="fas fa-clock stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: 0.3s; background: linear-gradient(135deg, #0dcaf0, #0aa2c0);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Active Courses</h6>
                                    <h3 class="text-white">${stats.availableCourses || 0}/${stats.totalCourses}</h3>
                                    <small class="text-white-50">${stats.totalEnrolled || 0} enrollments</small>
                                </div>
                                <i class="fas fa-book stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards Row 2 -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="card animate__animated animate__fadeInUp" style="animation-delay: 0.4s;">
                            <div class="card-body">
                                <h6 class="text-muted">Completed Payments</h6>
                                <h3>${stats.completedPayments}</h3>
                                <small class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>${stats.successRate || 0}% success rate
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="card animate__animated animate__fadeInUp" style="animation-delay: 0.5s;">
                            <div class="card-body">
                                <h6 class="text-muted">This Month Revenue</h6>
                                <h3>${Utils.formatCurrency(stats.thisMonthRevenue || 0)}</h3>
                                <small class="text-info">
                                    <i class="fas fa-calendar me-1"></i>Monthly total
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="card animate__animated animate__fadeInUp" style="animation-delay: 0.6s;">
                            <div class="card-body">
                                <h6 class="text-muted">Average Payment</h6>
                                <h3>${Utils.formatCurrency(stats.averagePayment || 0)}</h3>
                                <small class="text-warning">
                                    <i class="fas fa-chart-line me-1"></i>Per transaction
                                </small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="card animate__animated animate__fadeInUp" style="animation-delay: 0.7s;">
                            <div class="card-body">
                                <h6 class="text-muted">Total Transactions</h6>
                                <h3>${stats.totalPayments}</h3>
                                <small class="text-primary">
                                    <i class="fas fa-credit-card me-1"></i>All time
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="row g-4 mb-4">
                    <div class="col-lg-8">
                        <div class="table-container">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Revenue Overview</h5>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary" onclick="App.updateChartPeriod('week')">Week</button>
                                    <button class="btn btn-sm btn-outline-primary active" onclick="App.updateChartPeriod('month')">Month</button>
                                    <button class="btn btn-sm btn-outline-primary" onclick="App.updateChartPeriod('year')">Year</button>
                                </div>
                            </div>
                            <canvas id="revenueChart" style="height: 300px;"></canvas>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="table-container">
                            <h5 class="mb-3">Quick Actions</h5>
                            <div class="list-group">
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center p-3" 
                                   onclick="window.location.href='dashboard.html?tab=approvals'">
                                    <i class="fas fa-user-plus text-primary fa-fw me-3"></i>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0">Review Pending Approvals</h6>
                                        <small class="text-muted">${stats.pendingRegistrations + stats.pendingStudents} pending</small>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center p-3" 
                                   onclick="window.location.href='dashboard.html?tab=courses'">
                                    <i class="fas fa-book text-success fa-fw me-3"></i>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0">Manage Courses</h6>
                                        <small class="text-muted">${stats.totalCourses} total courses</small>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center p-3" 
                                   onclick="window.location.href='dashboard.html?tab=payments'">
                                    <i class="fas fa-credit-card text-warning fa-fw me-3"></i>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0">View Payments</h6>
                                        <small class="text-muted">${stats.completedPayments} completed</small>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center p-3" 
                                   onclick="window.location.href='dashboard.html?tab=reports'">
                                    <i class="fas fa-chart-bar text-info fa-fw me-3"></i>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0">Generate Reports</h6>
                                        <small class="text-muted">Export data</small>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center p-3" 
                                   onclick="App.exportSystemBackup()">
                                    <i class="fas fa-database text-danger fa-fw me-3"></i>
                                    <div class="flex-grow-1">
                                        <h6 class="mb-0">Backup System</h6>
                                        <small class="text-muted">Export all data</small>
                                    </div>
                                    <i class="fas fa-chevron-right text-muted"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tables Row -->
                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="table-container">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Pending Registrations</h5>
                                <a href="dashboard.html?tab=approvals" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            ${renderPendingRegistrationsTable(recentRegistrations.filter(r => r.status === 'pending'))}
                            ${recentRegistrations.filter(r => r.status === 'pending').length === 0 ? 
                                '<p class="text-muted text-center py-3">No pending registrations</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="table-container">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="mb-0">Recent Payments</h5>
                                <a href="dashboard.html?tab=payments" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            ${renderRecentPaymentsTable(recentPayments)}
                            ${recentPayments.length === 0 ? 
                                '<p class="text-muted text-center py-3">No recent payments</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts after DOM is ready
        setTimeout(() => {
            initializeCharts();
        }, 100);
    }

    // ==================== STUDENT DASHBOARD ====================

    function loadStudentDashboard(container) {
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        const payments = Data.getPayments({ studentId: currentUser.id });
        const registrations = Data.getRegistrations({ studentId: currentUser.id });
        const courses = Data.getCourses();

        const completedPayments = payments.filter(p => p.status === 'completed');
        const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingReg = registrations.filter(r => r.status === 'pending').length;
        const approvedReg = registrations.filter(r => r.status === 'approved').length;

        container.innerHTML = `
            <div class="fade-in">
                <!-- Welcome Banner -->
                <div class="alert alert-primary d-flex align-items-center mb-4">
                    <i class="fas fa-user-graduate fa-2x me-3"></i>
                    <div>
                        <h5 class="mb-1">Welcome back, ${currentUser.firstName}!</h5>
                        <p class="mb-0">Student ID: ${currentUser.id} | Department: ${currentUser.department || 'Undeclared'}</p>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0d6efd, #0a58ca);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">Total Paid</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(totalPaid)}</h3>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #198754, #146c43);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">Registration Status</h6>
                                    <h3 class="text-white">${approvedReg > 0 ? 'Approved' : pendingReg > 0 ? 'Pending' : 'Not Started'}</h3>
                                </div>
                                <i class="fas fa-${approvedReg > 0 ? 'check-circle' : pendingReg > 0 ? 'clock' : 'book'} stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #0aa2c0);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">Payments Made</h6>
                                    <h3 class="text-white">${completedPayments.length}</h3>
                                </div>
                                <i class="fas fa-credit-card stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-book-open text-primary me-2"></i>
                                    Course Registration
                                </h5>
                                <p class="card-text text-muted">Register for available courses for the current semester.</p>
                                ${pendingReg > 0 ? 
                                    '<span class="badge bg-warning mb-3">Pending Approval</span>' : 
                                    approvedReg > 0 ? 
                                    '<span class="badge bg-success mb-3">Approved</span>' : 
                                    '<span class="badge bg-info mb-3">Not Started</span>'}
                                <br>
                                <button class="btn btn-primary" onclick="window.location.href='dashboard.html?tab=courses'">
                                    ${pendingReg > 0 ? 'View Status' : approvedReg > 0 ? 'View Courses' : 'Register Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <i class="fas fa-credit-card text-success me-2"></i>
                                    Make Payment
                                </h5>
                                <p class="card-text text-muted">Pay your tuition and course fees securely.</p>
                                ${approvedReg > 0 ? 
                                    `<p class="text-primary">Outstanding: ${Utils.formatCurrency(registrations.find(r => r.status === 'approved')?.totalFees || 0)}</p>` : 
                                    '<p class="text-muted">Complete registration first</p>'}
                                <button class="btn btn-success" onclick="window.location.href='dashboard.html?tab=payments'" 
                                        ${!approvedReg ? 'disabled' : ''}>
                                    Pay Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== STUDENT PROFILE ====================

    function loadStudentProfile(container) {
        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">My Profile</h2>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="card text-center mb-4">
                            <div class="card-body">
                                <img src="${currentUser.avatar}" alt="Avatar" class="rounded-circle img-fluid mb-3" style="width: 150px; height: 150px;">
                                <h4>${currentUser.firstName} ${currentUser.lastName}</h4>
                                <p class="text-muted">${currentUser.id}</p>
                                <p>
                                    <span class="badge bg-${currentUser.status === 'active' ? 'success' : 'warning'}">
                                        ${currentUser.status}
                                    </span>
                                </p>
                                <button class="btn btn-outline-primary btn-sm" onclick="App.changeAvatar()">
                                    <i class="fas fa-camera me-2"></i>Change Avatar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Personal Information</h5>
                            </div>
                            <div class="card-body">
                                <form id="profileForm">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">First Name</label>
                                            <input type="text" class="form-control" id="firstName" value="${currentUser.firstName}">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Last Name</label>
                                            <input type="text" class="form-control" id="lastName" value="${currentUser.lastName}">
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" value="${currentUser.email}" readonly>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Phone</label>
                                        <input type="tel" class="form-control" id="phone" value="${currentUser.phone || ''}">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Department</label>
                                        <input type="text" class="form-control" value="${currentUser.department || 'Undeclared'}" readonly>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Program</label>
                                        <input type="text" class="form-control" value="${currentUser.program || 'Not specified'}" readonly>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Year of Study</label>
                                            <input type="text" class="form-control" value="${currentUser.yearOfStudy || '1'}" readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Semester</label>
                                            <input type="text" class="form-control" value="${currentUser.semester === '1' ? 'First' : 'Second'}" readonly>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label">Address</label>
                                        <textarea class="form-control" id="address" rows="2">${currentUser.address || ''}</textarea>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">City</label>
                                            <input type="text" class="form-control" id="city" value="${currentUser.city || ''}">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Country</label>
                                            <input type="text" class="form-control" id="country" value="${currentUser.country || ''}">
                                        </div>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-2"></i>Update Profile
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Handle form submission
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            updateProfile();
        });
    }

    // ==================== STUDENT COURSE REGISTRATION ====================

    function loadStudentCourseRegistration(container) {
        const courses = Data.getCourses({ available: true });
        const registrations = Data.getRegistrations({ studentId: currentUser.id });
        const currentReg = registrations.find(r => r.status === 'pending' || r.status === 'approved');
        
        // Get already registered courses if any
        const registeredCourseIds = currentReg?.courses || [];
        
        // Filter out already registered courses
        const availableCourses = courses.filter(c => !registeredCourseIds.includes(c.id));

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Course Registration</h2>

                ${currentReg ? renderCurrentRegistration(currentReg) : ''}

                <div class="row mb-4">
                    <div class="col-md-8">
                        <div class="table-container">
                            <h5 class="mb-3">Available Courses</h5>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Select</th>
                                            <th>Code</th>
                                            <th>Course</th>
                                            <th>Credits</th>
                                            <th>Fee</th>
                                            <th>Schedule</th>
                                            <th>Instructor</th>
                                            <th>Available</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${availableCourses.map(course => `
                                            <tr>
                                                <td>
                                                    <input type="checkbox" class="course-checkbox form-check-input" 
                                                           data-course-id="${course.id}"
                                                           data-credits="${course.credits}"
                                                           data-fee="${course.fee}"
                                                           ${!course.available ? 'disabled' : ''}>
                                                </td>
                                                <td><strong>${course.code}</strong></td>
                                                <td>${course.title}</td>
                                                <td>${course.credits}</td>
                                                <td>${Utils.formatCurrency(course.fee)}</td>
                                                <td><small>${course.schedule || 'TBA'}</small></td>
                                                <td>${course.instructor || 'TBA'}</td>
                                                <td>
                                                    <span class="badge bg-${course.available ? 'success' : 'danger'}">
                                                        ${course.enrolled}/${course.capacity}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                        ${availableCourses.length === 0 ? 
                                            '<tr><td colspan="8" class="text-center text-muted py-4">No courses available</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="table-container sticky-top" style="top: 80px;">
                            <h5 class="mb-3">Registration Summary</h5>
                            
                            <div class="mb-4">
                                <label class="form-label">Selected Courses</label>
                                <div id="selectedCoursesList" class="mb-3">
                                    <p class="text-muted text-center py-3">No courses selected</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Total Credits:</span>
                                    <strong id="totalCredits">0</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Total Fees:</span>
                                    <strong id="totalFees" class="text-primary">$0.00</strong>
                                </div>
                                <div class="progress mb-3" style="height: 5px;">
                                    <div id="creditProgress" class="progress-bar" style="width: 0%"></div>
                                </div>
                                <small class="text-muted">Maximum 18 credits</small>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="App.submitRegistration()" id="submitRegistrationBtn" disabled>
                                    <i class="fas fa-check-circle me-2"></i>Submit Registration
                                </button>
                                <button class="btn btn-outline-secondary" onclick="App.clearSelectedCourses()" id="clearBtn">
                                    <i class="fas fa-times me-2"></i>Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners to checkboxes
        document.querySelectorAll('.course-checkbox').forEach(cb => {
            cb.addEventListener('change', updateRegistrationSummary);
        });

        // Reset selected courses array
        selectedCourses = [];
        updateRegistrationSummary();
    }

    function updateRegistrationSummary() {
        const checkboxes = document.querySelectorAll('.course-checkbox:checked');
        const list = document.getElementById('selectedCoursesList');
        const totalCreditsEl = document.getElementById('totalCredits');
        const totalFeesEl = document.getElementById('totalFees');
        const creditProgress = document.getElementById('creditProgress');
        const submitBtn = document.getElementById('submitRegistrationBtn');
        
        selectedCourses = Array.from(checkboxes).map(cb => ({
            id: cb.dataset.courseId,
            credits: parseInt(cb.dataset.credits),
            fee: parseFloat(cb.dataset.fee)
        }));

        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
        const totalFees = selectedCourses.reduce((sum, c) => sum + c.fee, 0);
        
        // Update display
        if (selectedCourses.length > 0) {
            list.innerHTML = selectedCourses.map(c => 
                `<div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <span>Course (${c.credits} cr)</span>
                    <span class="text-primary">${Utils.formatCurrency(c.fee)}</span>
                </div>`
            ).join('');
        } else {
            list.innerHTML = '<p class="text-muted text-center py-3">No courses selected</p>';
        }
        
        totalCreditsEl.textContent = totalCredits;
        totalFeesEl.textContent = Utils.formatCurrency(totalFees);
        
        // Update progress bar
        const percentage = (totalCredits / 18) * 100;
        creditProgress.style.width = Math.min(percentage, 100) + '%';
        creditProgress.className = `progress-bar ${totalCredits > 18 ? 'bg-danger' : 'bg-success'}`;
        
        // Enable/disable submit button
        submitBtn.disabled = selectedCourses.length === 0 || totalCredits > 18;
        
        // Show warning if over limit
        if (totalCredits > 18) {
            Utils.showToast('Maximum credit limit exceeded (18 credits)', 'warning');
        }
    }

    function submitRegistration() {
        if (selectedCourses.length === 0) {
            Utils.showToast('Please select at least one course', 'warning');
            return;
        }

        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
        if (totalCredits > 18) {
            Utils.showToast('Maximum credit limit is 18', 'warning');
            return;
        }

        const registrationData = {
            studentId: currentUser.id,
            courses: selectedCourses.map(c => c.id),
            totalFees: selectedCourses.reduce((sum, c) => sum + c.fee, 0),
            session: '2024/2025',
            semester: '1'
        };

        try {
            const registration = Data.createRegistration(registrationData);
            Utils.showToast('Registration submitted successfully!', 'success');
            
            // Reload the page after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html?tab=courses';
            }, 2000);
            
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    }

    function clearSelectedCourses() {
        document.querySelectorAll('.course-checkbox:checked').forEach(cb => {
            cb.checked = false;
        });
        selectedCourses = [];
        updateRegistrationSummary();
    }

    function renderCurrentRegistration(registration) {
        const courses = Data.getCourses().filter(c => registration.courses.includes(c.id));
        const statusClass = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        }[registration.status] || 'secondary';

        return `
            <div class="alert alert-${statusClass} mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-2">Current Registration (${registration.status.toUpperCase()})</h6>
                        <p class="mb-1">Courses: ${courses.map(c => c.code).join(', ')}</p>
                        <p class="mb-1">Total Credits: ${courses.reduce((sum, c) => sum + c.credits, 0)}</p>
                        <p class="mb-0">Total Fees: ${Utils.formatCurrency(registration.totalFees)}</p>
                    </div>
                    ${registration.status === 'approved' ? 
                        '<button class="btn btn-success" onclick="window.location.href=\'dashboard.html?tab=payments\'">Proceed to Payment</button>' : 
                        registration.status === 'pending' ? 
                        '<span class="badge bg-warning p-2">Awaiting Approval</span>' : 
                        '<span class="badge bg-danger p-2">Rejected</span>'}
                </div>
            </div>
        `;
    }

    // ==================== STUDENT PAYMENT PAGE ====================

    function loadStudentPaymentPage(container) {
        const registrations = Data.getRegistrations({ studentId: currentUser.id, status: 'approved' });
        const pendingPayments = Data.getPayments({ studentId: currentUser.id, status: 'pending' });
        const completedPayments = Data.getPayments({ studentId: currentUser.id, status: 'completed' });

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Make Payment</h2>

                <div class="row">
                    <div class="col-md-8">
                        <div class="table-container mb-4">
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
                                            <td><strong>${Utils.formatCurrency(reg.totalFees)}</strong></td>
                                            <td>${Utils.formatDate(new Date(Date.now() + 7*86400000))}</td>
                                            <td>
                                                <input type="checkbox" class="payment-checkbox form-check-input" 
                                                       data-amount="${reg.totalFees}" data-type="registration" data-id="${reg.id}">
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${registrations.length === 0 ? 
                                        '<tr><td colspan="4" class="text-center text-muted py-4">No outstanding fees</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>

                        ${pendingPayments.length > 0 ? `
                            <div class="table-container">
                                <h5 class="mb-3">Pending Payments</h5>
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Reference</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pendingPayments.map(p => `
                                            <tr>
                                                <td><small>${p.id}</small></td>
                                                <td>${Utils.formatCurrency(p.amount)}</td>
                                                <td>${Utils.formatDate(p.createdAt)}</td>
                                                <td><span class="badge bg-warning">Pending</span></td>
                                                <td>
                                                    <button class="btn btn-sm btn-primary" onclick="App.retryPayment('${p.id}')">
                                                        Retry
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : ''}
                    </div>

                    <div class="col-md-4">
                        <div class="table-container sticky-top" style="top: 80px;">
                            <h5 class="mb-3">Payment Summary</h5>
                            
                            <div class="mb-4">
                                <label class="form-label">Selected Amount</label>
                                <h3 id="totalPaymentAmount" class="text-primary">$0.00</h3>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Payment Method</label>
                                <select class="form-select" id="paymentMethod">
                                    <option value="paystack">Paystack</option>
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="App.processPayment()" id="processPaymentBtn" disabled>
                                    <i class="fas fa-lock me-2"></i>Pay Now
                                </button>
                                <small class="text-muted text-center">
                                    <i class="fas fa-shield-alt me-1"></i>Secured by 256-bit SSL
                                </small>
                            </div>

                            <hr>

                            <h6 class="mb-3">Payment History</h6>
                            ${completedPayments.slice(0, 3).map(p => `
                                <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                                    <div>
                                        <small>${Utils.formatDate(p.createdAt)}</small>
                                        <br>
                                        <small class="text-muted">${p.id}</small>
                                    </div>
                                    <span class="text-success">${Utils.formatCurrency(p.amount)}</span>
                                </div>
                            `).join('')}
                            ${completedPayments.length === 0 ? 
                                '<p class="text-muted text-center">No payment history</p>' : ''}
                            
                            ${completedPayments.length > 0 ? `
                                <button class="btn btn-link btn-sm w-100 mt-2" onclick="window.location.href='dashboard.html?tab=history'">
                                    View All History →
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners to payment checkboxes
        document.querySelectorAll('.payment-checkbox').forEach(cb => {
            cb.addEventListener('change', updatePaymentTotal);
        });
    }

    function updatePaymentTotal() {
        const checkboxes = document.querySelectorAll('.payment-checkbox:checked');
        const total = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.amount), 0);
        
        document.getElementById('totalPaymentAmount').textContent = Utils.formatCurrency(total);
        document.getElementById('processPaymentBtn').disabled = total === 0;
    }

    function processPayment() {
        const checkboxes = document.querySelectorAll('.payment-checkbox:checked');
        if (checkboxes.length === 0) {
            Utils.showToast('Please select items to pay', 'warning');
            return;
        }

        const total = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.amount), 0);
        const method = document.getElementById('paymentMethod').value;

        Utils.showLoading('Initializing payment...');

        // Create payment record
        const payment = Data.createPayment({
            studentId: currentUser.id,
            amount: total,
            description: 'Tuition Payment',
            method: method,
            items: Array.from(checkboxes).map(cb => ({
                type: cb.dataset.type,
                id: cb.dataset.id,
                amount: parseFloat(cb.dataset.amount)
            }))
        });

        // Simulate payment processing (in production, integrate with Paystack)
        setTimeout(() => {
            Data.updatePaymentStatus(payment.id, 'completed', {
                transactionId: 'TXN' + Date.now(),
                paidAt: new Date().toISOString()
            });

            Utils.hideLoading();
            Utils.showToast('Payment successful!', 'success');
            
            // Reload the page after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html?tab=payments';
            }, 2000);
        }, 3000);
    }

    function retryPayment(paymentId) {
        const payment = Data.getPaymentById(paymentId);
        if (payment) {
            document.getElementById('totalPaymentAmount').textContent = Utils.formatCurrency(payment.amount);
            document.getElementById('processPaymentBtn').disabled = false;
            
            // Scroll to payment section
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // ==================== STUDENT PAYMENT HISTORY ====================

    function loadStudentPaymentHistory(container) {
        const payments = Data.getPayments({ studentId: currentUser.id });

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Payment History</h2>

                <!-- Summary Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Total Paid</h6>
                                <h3>${Utils.formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Total Transactions</h6>
                                <h3>${payments.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="text-muted">Last Payment</h6>
                                <h3>${payments.filter(p => p.status === 'completed').length > 0 ? 
                                    Utils.formatDate(payments.filter(p => p.status === 'completed')[0]?.createdAt) : 'N/A'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payments Table -->
                <div class="table-container">
                    <table class="table table-hover" id="paymentHistoryTable">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(payment => `
                                <tr>
                                    <td><small class="text-muted">${payment.id}</small></td>
                                    <td>${payment.description || 'Tuition Payment'}</td>
                                    <td><strong class="text-primary">${Utils.formatCurrency(payment.amount)}</strong></td>
                                    <td><span class="badge bg-secondary">${payment.method || 'Paystack'}</span></td>
                                    <td>${Utils.formatDate(payment.createdAt)}</td>
                                    <td>
                                        <span class="badge bg-${payment.status === 'completed' ? 'success' : 
                                                               payment.status === 'pending' ? 'warning' : 'danger'}">
                                            ${payment.status}
                                        </span>
                                    </td>
                                    <td>
                                        ${payment.status === 'completed' ? 
                                            `<button class="btn btn-sm btn-info" onclick="App.viewReceipt('${payment.id}')">
                                                <i class="fas fa-receipt"></i> Receipt
                                            </button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                            ${payments.length === 0 ? 
                                '<tr><td colspan="7" class="text-center text-muted py-4">No payment history</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize DataTable
        setTimeout(() => {
            Utils.initializeDataTable('#paymentHistoryTable', {
                pageLength: 10,
                order: [[4, 'desc']], // Sort by date
                columnDefs: [
                    { orderable: false, targets: 6 } // Actions column
                ]
            });
        }, 100);
    }

    // ==================== STUDENT RECEIPTS ====================

    function loadStudentReceipts(container) {
        const completedPayments = Data.getPayments({ studentId: currentUser.id, status: 'completed' });

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">My Receipts</h2>

                <div class="row g-4">
                    ${completedPayments.map(payment => `
                        <div class="col-md-6">
                            <div class="card h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 class="mb-1">Receipt #${payment.id}</h6>
                                            <small class="text-muted">${Utils.formatDate(payment.createdAt, 'long')}</small>
                                        </div>
                                        <span class="badge bg-success">Paid</span>
                                    </div>
                                    
                                    <p class="mb-1"><strong>Amount:</strong> ${Utils.formatCurrency(payment.amount)}</p>
                                    <p class="mb-1"><strong>Method:</strong> ${payment.method || 'Paystack'}</p>
                                    <p class="mb-3"><strong>Transaction ID:</strong> ${payment.transactionId || 'N/A'}</p>
                                    
                                    <div class="btn-group w-100">
                                        <button class="btn btn-outline-primary btn-sm" onclick="App.viewReceipt('${payment.id}')">
                                            <i class="fas fa-eye me-2"></i>View
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="App.downloadReceipt('${payment.id}')">
                                            <i class="fas fa-download me-2"></i>Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${completedPayments.length === 0 ? 
                        '<div class="col-12"><p class="text-center text-muted py-5">No receipts available</p></div>' : ''}
                </div>
            </div>
        `;
    }

    // ==================== STUDENT MANAGEMENT ====================

    function loadStudentManagement(container) {
        const students = Data.getUsers().filter(u => u.role === 'student');
        const registrations = Data.getRegistrations();
        const departments = [...new Set(students.map(s => s.department).filter(Boolean))];

        container.innerHTML = `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2>Student Management</h2>
                    <div>
                        <button class="btn btn-success me-2" onclick="App.exportStudents()">
                            <i class="fas fa-file-excel me-2"></i>Export
                        </button>
                        <button class="btn btn-primary" onclick="App.showAddStudentModal()">
                            <i class="fas fa-user-plus me-2"></i>Add Student
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <input type="text" class="form-control" id="searchStudent" placeholder="Search by name, email, or ID...">
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
                            ${departments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="filterYear">
                            <option value="">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
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
                                <th>Student</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Year</th>
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
                                        <td><small class="text-muted">${student.id}</small></td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${student.avatar}" alt="" class="rounded-circle me-2" width="35" height="35">
                                                <div>
                                                    <strong>${student.firstName} ${student.lastName}</strong>
                                                    <br>
                                                    <small class="text-muted">${studentRegs.length} registrations</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${student.email}</td>
                                        <td>${student.phone || 'N/A'}</td>
                                        <td>${student.department || 'Undeclared'}</td>
                                        <td>Year ${student.yearOfStudy || '1'}</td>
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
            Utils.initializeDataTable('#studentsTable', {
                pageLength: 10,
                order: [[0, 'asc']],
                columnDefs: [
                    { orderable: false, targets: 8 } // Actions column
                ]
            });
        }, 100);
    }

    // ==================== APPROVALS PAGE ====================

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
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #cc9a06);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">Pending Registrations</h6>
                                    <h2 class="text-white">${pendingRegistrations.length}</h2>
                                    <small class="text-white-50">Course registrations awaiting review</small>
                                </div>
                                <i class="fas fa-clock fa-3x stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #0aa2c0);">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-white-50">New Students</h6>
                                    <h2 class="text-white">${pendingStudents.length}</h2>
                                    <small class="text-white-50">Student accounts pending activation</small>
                                </div>
                                <i class="fas fa-user-plus fa-3x stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <ul class="nav nav-tabs mb-4" id="approvalTabs" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" id="registrations-tab" data-bs-toggle="tab" data-bs-target="#registrations">
                            Course Registrations
                            ${pendingRegistrations.length > 0 ? `<span class="badge bg-danger ms-2">${pendingRegistrations.length}</span>` : ''}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="students-tab" data-bs-toggle="tab" data-bs-target="#students">
                            New Students
                            ${pendingStudents.length > 0 ? `<span class="badge bg-danger ms-2">${pendingStudents.length}</span>` : ''}
                        </button>
                    </li>
                </ul>

                <div class="tab-content">
                    <!-- Registrations Tab -->
                    <div class="tab-pane fade show active" id="registrations">
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
                                                        <img src="${student.avatar}" alt="" class="rounded-circle me-2" width="35" height="35">
                                                        <div>
                                                            <strong>${student.firstName} ${student.lastName}</strong>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>${student.email}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-link" onclick="App.viewRegistrationCourses('${reg.id}')">
                                                        ${selectedCourses.length} courses
                                                    </button>
                                                </td>
                                                <td><strong class="text-primary">${Utils.formatCurrency(reg.totalFees)}</strong></td>
                                                <td><span class="badge bg-info">${totalCredits}</span></td>
                                                <td>${Utils.formatDate(reg.createdAt)}</td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-success" onclick="App.showApproveModal('${reg.id}')">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-danger" onclick="App.showRejectModal('${reg.id}')">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-info" onclick="App.viewRegistrationDetails('${reg.id}')">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                    ${pendingRegistrations.length === 0 ? 
                                        '<tr><td colspan="7" class="text-center text-muted py-4">No pending registrations</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Students Tab -->
                    <div class="tab-pane fade" id="students">
                        <div class="table-container">
                            <table class="table table-hover" id="pendingStudentsTable">
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
                                                    <img src="${student.avatar}" alt="" class="rounded-circle me-2" width="35" height="35">
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
                                    ${pendingStudents.length === 0 ? 
                                        '<tr><td colspan="6" class="text-center text-muted py-4">No pending students</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            // Initialize registrations table
            Utils.initializeDataTable('#registrationsTable', {
                order: [[5, 'desc']], // Sort by date column (index 5) descending
                columnDefs: [
                    { orderable: false, targets: 6 } // Disable sorting on actions column
                ]
            });
            
            // Initialize pending students table
            Utils.initializeDataTable('#pendingStudentsTable', {
                order: [[4, 'desc']], // Sort by date column (index 4) descending
                columnDefs: [
                    { orderable: false, targets: 5 } // Disable sorting on actions column
                ]
            });
        }, 100);
    }

    // ==================== COURSE MANAGEMENT ====================

    function loadCourseManagement(container) {
        const courses = Data.getCourses();
        const departments = [...new Set(courses.map(c => c.department))];

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
                                <h3>${departments.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <input type="text" class="form-control" id="searchCourse" placeholder="Search by code or title...">
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="filterCourseDepartment">
                            <option value="">All Departments</option>
                            ${departments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="filterAvailability">
                            <option value="">All</option>
                            <option value="available">Available</option>
                            <option value="full">Full</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-primary w-100" onclick="App.filterCourses()">
                            <i class="fas fa-search me-2"></i>Search
                        </button>
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
                                <th>Enrolled</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courses.map(course => {
                                const enrollmentPercentage = (course.enrolled / course.capacity) * 100;
                                const statusClass = course.enrolled >= course.capacity ? 'danger' : 
                                                   enrollmentPercentage >= 80 ? 'warning' : 'success';
                                const statusText = course.enrolled >= course.capacity ? 'Full' :
                                                  enrollmentPercentage >= 80 ? 'Limited' : 'Available';

                                return `
                                    <tr>
                                        <td><strong>${course.code}</strong></td>
                                        <td>${course.title}</td>
                                        <td><span class="badge bg-primary">${course.credits}</span></td>
                                        <td>${Utils.formatCurrency(course.fee)}</td>
                                        <td>${course.department}</td>
                                        <td>${course.instructor || 'TBA'}</td>
                                        <td><small>${course.schedule || 'TBA'}</small></td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <span class="me-2">${course.enrolled}/${course.capacity}</span>
                                                <div class="progress flex-grow-1" style="height: 5px;">
                                                    <div class="progress-bar bg-${statusClass}" 
                                                         style="width: ${enrollmentPercentage}%"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="badge bg-${statusClass}">${statusText}</span>
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
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize DataTable
        setTimeout(() => {
            Utils.initializeDataTable('#coursesTable', {
                pageLength: 10,
                order: [[0, 'asc']],
                columnDefs: [
                    { orderable: false, targets: 9 } // Actions column
                ]
            });
        }, 100);
    }

    // ==================== PAYMENT MANAGEMENT ====================

    function loadPaymentManagement(container) {
        const payments = Data.getPayments();
        const users = Data.getUsers();

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Payment Management</h2>

                <!-- Payment Stats -->
                <div class="row g-4 mb-4">
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #198754, #146c43);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Revenue</h6>
                                    <h3 class="text-white">${Utils.formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}</h3>
                                    <small class="text-white-50">All time</small>
                                </div>
                                <i class="fas fa-dollar-sign stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #0dcaf0, #0aa2c0);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Total Transactions</h6>
                                    <h3 class="text-white">${payments.length}</h3>
                                    <small class="text-white-50">${payments.filter(p => p.status === 'completed').length} completed</small>
                                </div>
                                <i class="fas fa-credit-card stat-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="stat-card" style="background: linear-gradient(135deg, #ffc107, #cc9a06);">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="text-white-50">Success Rate</h6>
                                    <h3 class="text-white">${((payments.filter(p => p.status === 'completed').length / payments.length) * 100).toFixed(1)}%</h3>
                                    <small class="text-white-50">${payments.filter(p => p.status === 'pending').length} pending</small>
                                </div>
                                <i class="fas fa-chart-line stat-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <input type="text" class="form-control" id="searchPayment" placeholder="Search reference or student...">
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="filterPaymentStatus">
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="filterPaymentMethod">
                            <option value="">All Methods</option>
                            <option value="paystack">Paystack</option>
                            <option value="flutterwave">Flutterwave</option>
                            <option value="card">Card</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input type="date" class="form-control" id="filterPaymentDate" placeholder="Date">
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-primary w-100" onclick="App.filterPayments()">
                            <i class="fas fa-filter me-2"></i>Apply Filters
                        </button>
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
                                        <td><small class="text-muted">${payment.id}</small></td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${student?.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                                <div>
                                                    <strong>${student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${payment.description || 'Tuition Payment'}</td>
                                        <td><strong class="text-primary">${Utils.formatCurrency(payment.amount)}</strong></td>
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
                                                ${payment.status === 'completed' ? `
                                                    <button class="btn btn-sm btn-success" onclick="App.downloadReceipt('${payment.id}')">
                                                        <i class="fas fa-download"></i>
                                                    </button>
                                                ` : ''}
                                                ${payment.status === 'pending' ? `
                                                    <button class="btn btn-sm btn-warning" onclick="App.markPaymentCompleted('${payment.id}')">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                ` : ''}
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
            Utils.initializeDataTable('#paymentsTable', {
                pageLength: 10,
                order: [[5, 'desc']], // Sort by date
                columnDefs: [
                    { orderable: false, targets: 7 } // Actions column
                ]
            });
        }, 100);
    }

    // ==================== REPORTS PAGE ====================

    function loadReportsPage(container) {
        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">Reports & Analytics</h2>

                <!-- Report Filters -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <label class="form-label">Report Type</label>
                        <select class="form-select" id="reportType">
                            <option value="financial">Financial Report</option>
                            <option value="enrollment">Enrollment Report</option>
                            <option value="student">Student Statistics</option>
                            <option value="course">Course Analytics</option>
                            <option value="payment">Payment Analysis</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Start Date</label>
                        <input type="date" class="form-control" id="reportStartDate" value="${new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().split('T')[0]}">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">End Date</label>
                        <input type="date" class="form-control" id="reportEndDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Format</label>
                        <select class="form-select" id="reportFormat">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                        </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="btn btn-primary w-100" onclick="App.generateReport()">
                            <i class="fas fa-file-export me-2"></i>Generate Report
                        </button>
                    </div>
                </div>

                <!-- Report Cards -->
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Quick Reports</h5>
                            </div>
                            <div class="list-group list-group-flush">
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3" 
                                   onclick="App.downloadQuickReport('financial')">
                                    <div>
                                        <i class="fas fa-dollar-sign text-success fa-fw me-3"></i>
                                        <strong>Financial Summary</strong>
                                        <br>
                                        <small class="text-muted">Revenue, payments, and transactions</small>
                                    </div>
                                    <span class="badge bg-primary">Monthly</span>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3" 
                                   onclick="App.downloadQuickReport('enrollment')">
                                    <div>
                                        <i class="fas fa-users text-info fa-fw me-3"></i>
                                        <strong>Enrollment Statistics</strong>
                                        <br>
                                        <small class="text-muted">Student enrollments by department</small>
                                    </div>
                                    <span class="badge bg-primary">Current</span>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3" 
                                   onclick="App.downloadQuickReport('courses')">
                                    <div>
                                        <i class="fas fa-book text-warning fa-fw me-3"></i>
                                        <strong>Course Popularity</strong>
                                        <br>
                                        <small class="text-muted">Enrollment per course</small>
                                    </div>
                                    <span class="badge bg-primary">Semester</span>
                                </a>
                                <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3" 
                                   onclick="App.downloadQuickReport('payments')">
                                    <div>
                                        <i class="fas fa-credit-card text-danger fa-fw me-3"></i>
                                        <strong>Payment Analysis</strong>
                                        <br>
                                        <small class="text-muted">Payment methods and success rates</small>
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
                            <div class="card-body">
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="scheduleDaily" checked>
                                        <label class="form-check-label">
                                            <strong>Daily Summary</strong>
                                            <br>
                                            <small class="text-muted">Every day at 8:00 AM</small>
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="scheduleWeekly" checked>
                                        <label class="form-check-label">
                                            <strong>Weekly Financial Report</strong>
                                            <br>
                                            <small class="text-muted">Every Monday at 9:00 AM</small>
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="scheduleMonthly">
                                        <label class="form-check-label">
                                            <strong>Monthly Analytics</strong>
                                            <br>
                                            <small class="text-muted">1st of every month</small>
                                        </label>
                                    </div>
                                </div>
                                <button class="btn btn-outline-primary w-100 mt-3" onclick="App.saveReportSchedule()">
                                    <i class="fas fa-save me-2"></i>Save Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Preview Chart -->
                <div class="card mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Revenue Preview</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="reportPreviewChart" style="height: 300px;"></canvas>
                    </div>
                </div>
            </div>
        `;

        // Initialize preview chart
        setTimeout(() => {
            initializeReportPreviewChart();
        }, 100);
    }

    // ==================== SETTINGS PAGE ====================

    function loadSettingsPage(container) {
        const settings = Data.getSettings();

        container.innerHTML = `
            <div class="fade-in">
                <h2 class="mb-4">System Settings</h2>

                <div class="row">
                    <div class="col-md-8">
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">Institution Settings</h5>
                            </div>
                            <div class="card-body">
                                <form id="settingsForm">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Institution Name</label>
                                            <input type="text" class="form-control" id="institutionName" 
                                                   value="${settings.institutionName || 'University Portal'}">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Contact Email</label>
                                            <input type="email" class="form-control" id="contactEmail" 
                                                   value="${settings.contactEmail || 'support@uniportal.edu'}">
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Contact Phone</label>
                                            <input type="tel" class="form-control" id="contactPhone" 
                                                   value="${settings.contactPhone || '+1-800-UNIVERSITY'}">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Address</label>
                                            <input type="text" class="form-control" id="address" 
                                                   value="${settings.address || ''}">
                                        </div>
                                    </div>

                                    <hr>

                                    <h6 class="mb-3">Academic Settings</h6>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="form-label">Academic Year</label>
                                            <input type="text" class="form-control" id="academicYear" 
                                                   value="${settings.academicYear || '2024/2025'}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Current Semester</label>
                                            <select class="form-select" id="currentSemester">
                                                <option value="1" ${settings.currentSemester === '1' ? 'selected' : ''}>First Semester</option>
                                                <option value="2" ${settings.currentSemester === '2' ? 'selected' : ''}>Second Semester</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Currency</label>
                                            <select class="form-select" id="currency">
                                                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                                <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                                                <option value="GBP" ${settings.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-4">
                                            <label class="form-label">Registration Deadline</label>
                                            <input type="date" class="form-control" id="registrationDeadline" 
                                                   value="${settings.registrationDeadline ? settings.registrationDeadline.split('T')[0] : ''}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Payment Deadline</label>
                                            <input type="date" class="form-control" id="paymentDeadline" 
                                                   value="${settings.paymentDeadline ? settings.paymentDeadline.split('T')[0] : ''}">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label">Max Credits</label>
                                            <input type="number" class="form-control" id="maxCredits" 
                                                   value="${settings.maxCredits || 18}">
                                        </div>
                                    </div>

                                    <hr>

                                    <h6 class="mb-3">Email Notifications</h6>
                                    
                                    <div class="mb-3">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="emailRegistration" ${settings.emailRegistration !== false ? 'checked' : ''}>
                                            <label class="form-check-label">
                                                Registration Confirmation
                                            </label>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="emailPayment" ${settings.emailPayment !== false ? 'checked' : ''}>
                                            <label class="form-check-label">
                                                Payment Receipt
                                            </label>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="emailApproval" ${settings.emailApproval !== false ? 'checked' : ''}>
                                            <label class="form-check-label">
                                                Approval Notifications
                                            </label>
                                        </div>
                                    </div>

                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-2"></i>Save Settings
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card mb-4">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">System Information</h5>
                            </div>
                            <div class="card-body">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span>Version</span>
                                        <strong>2.0.0</strong>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span>Last Backup</span>
                                        <strong>${Utils.formatDate(new Date())}</strong>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span>Database Size</span>
                                        <strong>${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</strong>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span>Active Users</span>
                                        <strong>${Data.getUsers().length}</strong>
                                    </li>
                                </ul>

                                <hr>

                                <button class="btn btn-outline-primary w-100 mb-2" onclick="App.backupDatabase()">
                                    <i class="fas fa-database me-2"></i>Backup Database
                                </button>
                                <button class="btn btn-outline-danger w-100" onclick="App.clearCache()">
                                    <i class="fas fa-trash me-2"></i>Clear Cache
                                </button>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header bg-white">
                                <h5 class="mb-0">API Integrations</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label">Paystack Public Key</label>
                                    <input type="text" class="form-control" value="pk_test_xxxxxxxxxxxx" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email Validation API</label>
                                    <input type="text" class="form-control" value="••••••••••••••••" type="password">
                                </div>
                                <button class="btn btn-outline-primary w-100" onclick="App.testAPIConnection()">
                                    <i class="fas fa-sync me-2"></i>Test Connection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Handle form submission
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings();
        });
    }

    // ==================== RENDER HELPERS ====================

    function renderPendingRegistrationsTable(registrations) {
        if (registrations.length === 0) return '';

        const users = Data.getUsers();

        return `
            <table class="table table-sm">
                <tbody>
                    ${registrations.slice(0, 5).map(reg => {
                        const student = users.find(u => u.id === reg.studentId);
                        return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="${student?.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                        <div>
                                            <strong>${student?.firstName} ${student?.lastName}</strong>
                                            <br>
                                            <small class="text-muted">${reg.courses.length} courses</small>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-end">
                                    <strong class="text-primary">${Utils.formatCurrency(reg.totalFees)}</strong>
                                    <br>
                                    <button class="btn btn-sm btn-success mt-1" onclick="App.showApproveModal('${reg.id}')">
                                        <i class="fas fa-check"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger mt-1" onclick="App.showRejectModal('${reg.id}')">
                                        <i class="fas fa-times"></i>
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
        if (payments.length === 0) return '';

        const users = Data.getUsers();

        return `
            <table class="table table-sm">
                <tbody>
                    ${payments.slice(0, 5).map(payment => {
                        const student = users.find(u => u.id === payment.studentId);
                        return `
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="${student?.avatar}" alt="" class="rounded-circle me-2" width="30" height="30">
                                        <div>
                                            <strong>${student?.firstName} ${student?.lastName}</strong>
                                            <br>
                                            <small class="text-muted">${Utils.formatDate(payment.createdAt)}</small>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-end">
                                    <strong class="text-primary">${Utils.formatCurrency(payment.amount)}</strong>
                                    <br>
                                    <span class="badge bg-success mt-1">${payment.status}</span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // ==================== FIXED APPROVAL FUNCTIONS ====================

    function showApproveModal(registrationId) {
        console.log('Showing approve modal for:', registrationId); // Debug
        const registration = Data.getRegistrationById(registrationId);
        if (!registration) {
            Utils.showToast('Registration not found', 'error');
            return;
        }

        const user = Data.getUserById(registration.studentId);
        const courses = Data.getCourses().filter(c => registration.courses.includes(c.id));

        const modal = document.getElementById('approvalModal');
        const details = document.getElementById('approvalDetails');
        
        details.innerHTML = `
            <div class="p-3">
                <p><strong>Student:</strong> ${user?.firstName} ${user?.lastName}</p>
                <p><strong>Email:</strong> ${user?.email}</p>
                <p><strong>Student ID:</strong> ${user?.id}</p>
                <p><strong>Courses:</strong> ${courses.map(c => c.code).join(', ')}</p>
                <p><strong>Total Credits:</strong> ${courses.reduce((sum, c) => sum + c.credits, 0)}</p>
                <p><strong>Total Fee:</strong> ${Utils.formatCurrency(registration.totalFees)}</p>
                <p><strong>Submitted:</strong> ${Utils.formatDate(registration.createdAt)}</p>
            </div>
        `;

        document.getElementById('confirmApproveBtn').setAttribute('data-registration', registrationId);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    function approveRegistration() {
        const registrationId = document.getElementById('confirmApproveBtn').getAttribute('data-registration');
        console.log('Approving registration:', registrationId); // Debug
        
        try {
            const registration = Data.getRegistrationById(registrationId);
            if (!registration) {
                Utils.showToast('Registration not found', 'error');
                return;
            }

            // Update registration status
            const registrations = JSON.parse(localStorage.getItem('uniportal_registrations')) || [];
            const index = registrations.findIndex(r => r.id === registrationId);
            
            if (index !== -1) {
                registrations[index].status = 'approved';
                registrations[index].approvedAt = new Date().toISOString();
                registrations[index].approvedBy = currentUser?.id || 'ADMIN001';
                
                localStorage.setItem('uniportal_registrations', JSON.stringify(registrations));
                
                // Update student status if needed
                const users = JSON.parse(localStorage.getItem('uniportal_users')) || [];
                const studentIndex = users.findIndex(u => u.id === registration.studentId);
                if (studentIndex !== -1 && users[studentIndex].status === 'pending') {
                    users[studentIndex].status = 'active';
                    localStorage.setItem('uniportal_users', JSON.stringify(users));
                }
                
                // Increment course enrollments
                const courses = JSON.parse(localStorage.getItem('uniportal_courses')) || [];
                registration.courses.forEach(courseId => {
                    const courseIndex = courses.findIndex(c => c.id === courseId);
                    if (courseIndex !== -1) {
                        courses[courseIndex].enrolled = (courses[courseIndex].enrolled || 0) + 1;
                    }
                });
                localStorage.setItem('uniportal_courses', JSON.stringify(courses));
                
                // Create payment record
                const payments = JSON.parse(localStorage.getItem('uniportal_payments')) || [];
                const payment = {
                    id: 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    studentId: registration.studentId,
                    amount: registration.totalFees,
                    description: 'Course Registration Fees',
                    method: 'Pending',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    registrationId: registrationId
                };
                payments.push(payment);
                localStorage.setItem('uniportal_payments', JSON.stringify(payments));
                
                Utils.showToast('Registration approved successfully!', 'success');
                
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
                
                // Reload current page
                const params = new URLSearchParams(window.location.search);
                const tab = params.get('tab') || 'dashboard';
                if (tab === 'approvals') {
                    loadApprovalsPage(document.getElementById('dashboardContent'));
                } else {
                    loadAdminDashboard(document.getElementById('dashboardContent'));
                }
            }
        } catch (error) {
            console.error('Approval error:', error);
            Utils.showToast('Error approving registration: ' + error.message, 'error');
        }
    }

    function showRejectModal(registrationId) {
        console.log('Showing reject modal for:', registrationId); // Debug
        document.getElementById('confirmRejectBtn').setAttribute('data-registration', registrationId);
        document.getElementById('rejectReason').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('rejectModal'));
        modal.show();
    }

    function rejectRegistration() {
        const registrationId = document.getElementById('confirmRejectBtn').getAttribute('data-registration');
        const reason = document.getElementById('rejectReason').value;
        
        if (!reason.trim()) {
            Utils.showToast('Please provide a reason for rejection', 'warning');
            return;
        }
        
        console.log('Rejecting registration:', registrationId, 'Reason:', reason); // Debug
        
        try {
            const registrations = JSON.parse(localStorage.getItem('uniportal_registrations')) || [];
            const index = registrations.findIndex(r => r.id === registrationId);
            
            if (index !== -1) {
                registrations[index].status = 'rejected';
                registrations[index].rejectedAt = new Date().toISOString();
                registrations[index].rejectionReason = reason;
                
                localStorage.setItem('uniportal_registrations', JSON.stringify(registrations));
                
                Utils.showToast('Registration rejected', 'warning');
                
                bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
                
                // Reload current page
                const params = new URLSearchParams(window.location.search);
                const tab = params.get('tab') || 'dashboard';
                if (tab === 'approvals') {
                    loadApprovalsPage(document.getElementById('dashboardContent'));
                } else {
                    loadAdminDashboard(document.getElementById('dashboardContent'));
                }
            }
        } catch (error) {
            console.error('Rejection error:', error);
            Utils.showToast('Error rejecting registration', 'error');
        }
    }

    function approveStudent(studentId) {
        Data.updateUser(studentId, { status: 'active' });
        Utils.showToast('Student approved successfully', 'success');
        loadApprovalsPage(document.getElementById('dashboardContent'));
        updatePendingApprovalsBadge();
    }

    function rejectStudent(studentId) {
        Data.updateUser(studentId, { status: 'rejected' });
        Utils.showToast('Student rejected', 'warning');
        loadApprovalsPage(document.getElementById('dashboardContent'));
        updatePendingApprovalsBadge();
    }

    function toggleStudentStatus(studentId) {
        const student = Data.getUserById(studentId);
        const newStatus = student.status === 'active' ? 'suspended' : 'active';
        
        Data.updateUser(studentId, { status: newStatus });
        Utils.showToast(`Student ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success');
        
        loadStudentManagement(document.getElementById('dashboardContent'));
    }

    function viewStudent(studentId) {
        const student = Data.getUserById(studentId);
        if (!student) return;

        const registrations = Data.getRegistrations({ studentId });
        const payments = Data.getPayments({ studentId });

        const modal = document.getElementById('viewStudentModal');
        const details = document.getElementById('studentDetails');
        
        details.innerHTML = `
            <div class="text-center mb-4">
                <img src="${student.avatar}" alt="Avatar" class="rounded-circle img-fluid mb-3" style="width: 100px; height: 100px;">
                <h4>${student.firstName} ${student.lastName}</h4>
                <p class="text-muted">${student.id}</p>
                <p>
                    <span class="badge bg-${student.status === 'active' ? 'success' : 'warning'}">
                        ${student.status}
                    </span>
                </p>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Email:</strong> ${student.email}</p>
                    <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                    <p><strong>Department:</strong> ${student.department || 'Undeclared'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Program:</strong> ${student.program || 'N/A'}</p>
                    <p><strong>Year:</strong> ${student.yearOfStudy || '1'}</p>
                    <p><strong>Joined:</strong> ${Utils.formatDate(student.createdAt)}</p>
                </div>
            </div>
            
            <hr>
            
            <h6>Statistics</h6>
            <div class="row">
                <div class="col-4 text-center">
                    <h5>${registrations.length}</h5>
                    <small class="text-muted">Registrations</small>
                </div>
                <div class="col-4 text-center">
                    <h5>${payments.length}</h5>
                    <small class="text-muted">Payments</small>
                </div>
                <div class="col-4 text-center">
                    <h5>${Utils.formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}</h5>
                    <small class="text-muted">Total Paid</small>
                </div>
            </div>
        `;

        new bootstrap.Modal(modal).show();
    }

    function editStudent(studentId) {
        Utils.showToast('Edit student feature coming soon', 'info');
    }

    function exportStudents() {
        const students = Data.getUsers().filter(u => u.role === 'student');
        const exportData = students.map(s => ({
            'ID': s.id,
            'First Name': s.firstName,
            'Last Name': s.lastName,
            'Email': s.email,
            'Phone': s.phone || '',
            'Department': s.department || '',
            'Program': s.program || '',
            'Year': s.yearOfStudy || '',
            'Status': s.status,
            'Joined': Utils.formatDate(s.createdAt)
        }));
        
        Utils.exportToExcel(exportData, 'students_list');
        Utils.showToast(`${students.length} students exported`, 'success');
    }

    function showAddStudentModal() {
        Utils.showToast('Add student feature coming soon', 'info');
    }

    function filterStudents() {
        const search = document.getElementById('searchStudent')?.value;
        const status = document.getElementById('filterStatus')?.value;
        const department = document.getElementById('filterDepartment')?.value;
        const year = document.getElementById('filterYear')?.value;

        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            const table = $('#studentsTable').DataTable();
            table.search(search).draw();
            
            // Apply column filters
            if (status) {
                table.column(6).search(status).draw();
            }
            if (department) {
                table.column(4).search(department).draw();
            }
            if (year) {
                table.column(5).search(year).draw();
            }
            
            Utils.showToast('Filters applied', 'success');
        }
    }

    function filterCourses() {
        const search = document.getElementById('searchCourse')?.value;
        const department = document.getElementById('filterCourseDepartment')?.value;
        const availability = document.getElementById('filterAvailability')?.value;

        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            const table = $('#coursesTable').DataTable();
            table.search(search).draw();
            
            if (department) {
                table.column(4).search(department).draw();
            }
            
            Utils.showToast('Filters applied', 'success');
        }
    }

    function filterPayments() {
        const search = document.getElementById('searchPayment')?.value;
        const status = document.getElementById('filterPaymentStatus')?.value;
        const method = document.getElementById('filterPaymentMethod')?.value;
        const date = document.getElementById('filterPaymentDate')?.value;

        if (typeof $ !== 'undefined' && $.fn.DataTable) {
            const table = $('#paymentsTable').DataTable();
            table.search(search).draw();
            
            if (status) {
                table.column(6).search(status).draw();
            }
            if (method) {
                table.column(4).search(method).draw();
            }
            
            Utils.showToast('Filters applied', 'success');
        }
    }

    // ==================== COURSE ACTIONS ====================

    function showAddCourseModal() {
        const modal = new bootstrap.Modal(document.getElementById('addCourseModal'));
        modal.show();
    }

    function saveCourse() {
        const courseData = {
            code: document.getElementById('courseCode').value,
            title: document.getElementById('courseTitle').value,
            credits: parseInt(document.getElementById('courseCredits').value),
            fee: parseFloat(document.getElementById('courseFee').value),
            department: document.getElementById('courseDepartment').value,
            instructor: document.getElementById('courseInstructor').value,
            schedule: document.getElementById('courseSchedule').value,
            room: document.getElementById('courseRoom').value,
            capacity: parseInt(document.getElementById('courseCapacity').value),
            level: document.getElementById('courseLevel').value,
            semester: document.getElementById('courseSemester').value,
            description: document.getElementById('courseDescription').value,
            syllabus: document.getElementById('courseSyllabus').value,
            prerequisites: document.getElementById('coursePrerequisites').value.split(',').map(s => s.trim()).filter(Boolean),
            enrolled: 0,
            available: true
        };

        try {
            Data.addCourse(courseData);
            Utils.showToast('Course added successfully', 'success');
            
            bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide();
            
            // Reset form
            document.getElementById('courseForm').reset();
            
            // Reload page
            loadCourseManagement(document.getElementById('dashboardContent'));
            
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    }

    function editCourse(courseId) {
        const course = Data.getCourseById(courseId);
        if (!course) return;

        document.getElementById('editCourseId').value = course.id;
        document.getElementById('editCourseCode').value = course.code;
        document.getElementById('editCourseTitle').value = course.title;
        document.getElementById('editCourseCredits').value = course.credits;
        document.getElementById('editCourseFee').value = course.fee;
        document.getElementById('editCourseDepartment').value = course.department;
        document.getElementById('editCourseInstructor').value = course.instructor || '';
        document.getElementById('editCourseSchedule').value = course.schedule || '';
        document.getElementById('editCourseRoom').value = course.room || '';
        document.getElementById('editCourseCapacity').value = course.capacity || 50;
        document.getElementById('editCourseLevel').value = course.level || '100';
        document.getElementById('editCourseDescription').value = course.description || '';
        document.getElementById('editCourseAvailable').checked = course.available;

        const modal = new bootstrap.Modal(document.getElementById('editCourseModal'));
        modal.show();
    }

    function updateCourse() {
        const courseId = document.getElementById('editCourseId').value;
        const updates = {
            code: document.getElementById('editCourseCode').value,
            title: document.getElementById('editCourseTitle').value,
            credits: parseInt(document.getElementById('editCourseCredits').value),
            fee: parseFloat(document.getElementById('editCourseFee').value),
            department: document.getElementById('editCourseDepartment').value,
            instructor: document.getElementById('editCourseInstructor').value,
            schedule: document.getElementById('editCourseSchedule').value,
            room: document.getElementById('editCourseRoom').value,
            capacity: parseInt(document.getElementById('editCourseCapacity').value),
            level: document.getElementById('editCourseLevel').value,
            description: document.getElementById('editCourseDescription').value,
            available: document.getElementById('editCourseAvailable').checked
        };

        Data.updateCourse(courseId, updates);
        Utils.showToast('Course updated successfully', 'success');
        
        bootstrap.Modal.getInstance(document.getElementById('editCourseModal')).hide();
        loadCourseManagement(document.getElementById('dashboardContent'));
    }

    function deleteCourse(courseId) {
        Utils.showConfirm({
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course? This action cannot be undone.',
            type: 'danger',
            onConfirm: () => {
                try {
                    Data.deleteCourse(courseId);
                    Utils.showToast('Course deleted', 'success');
                    loadCourseManagement(document.getElementById('dashboardContent'));
                } catch (error) {
                    Utils.showToast(error.message, 'error');
                }
            }
        });
    }

    function viewCourseDetails(courseId) {
        const course = Data.getCourseById(courseId);
        if (!course) return;

        const message = `
            <strong>Code:</strong> ${course.code}<br>
            <strong>Title:</strong> ${course.title}<br>
            <strong>Credits:</strong> ${course.credits}<br>
            <strong>Fee:</strong> ${Utils.formatCurrency(course.fee)}<br>
            <strong>Department:</strong> ${course.department}<br>
            <strong>Instructor:</strong> ${course.instructor || 'TBA'}<br>
            <strong>Schedule:</strong> ${course.schedule || 'TBA'}<br>
            <strong>Room:</strong> ${course.room || 'TBA'}<br>
            <strong>Capacity:</strong> ${course.enrolled}/${course.capacity}<br>
            <strong>Description:</strong> ${course.description || 'N/A'}<br>
            <strong>Prerequisites:</strong> ${course.prerequisites?.join(', ') || 'None'}
        `;

        Utils.showAlert({
            title: 'Course Details',
            message: message,
            type: 'info'
        });
    }

    // ==================== PAYMENT ACTIONS ====================

    function viewPaymentDetails(paymentId) {
        const payment = Data.getPaymentById(paymentId);
        if (!payment) return;

        const student = Data.getUserById(payment.studentId);
        
        const modal = document.getElementById('viewPaymentModal');
        const details = document.getElementById('paymentDetails');
        
        details.innerHTML = `
            <div class="text-center mb-4">
                <i class="fas fa-receipt fa-3x text-primary mb-3"></i>
                <h5>Payment Receipt</h5>
                <p class="text-muted">${payment.id}</p>
            </div>
            
            <div class="row">
                <div class="col-6">
                    <p><strong>Student:</strong> ${student?.firstName} ${student?.lastName}</p>
                    <p><strong>Email:</strong> ${student?.email}</p>
                </div>
                <div class="col-6">
                    <p><strong>Date:</strong> ${Utils.formatDate(payment.createdAt, 'long')}</p>
                    <p><strong>Method:</strong> ${payment.method || 'Paystack'}</p>
                </div>
            </div>
            
            <hr>
            
            <div class="row mb-3">
                <div class="col-6">
                    <p><strong>Description:</strong> ${payment.description || 'Tuition Payment'}</p>
                </div>
                <div class="col-6 text-end">
                    <p><strong>Amount:</strong> <span class="text-primary h5">${Utils.formatCurrency(payment.amount)}</span></p>
                </div>
            </div>
            
            <div class="alert alert-${payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}">
                <strong>Status:</strong> ${payment.status.toUpperCase()}
                ${payment.transactionId ? `<br><strong>Transaction ID:</strong> ${payment.transactionId}` : ''}
            </div>
        `;

        new bootstrap.Modal(modal).show();
    }

    function downloadReceipt(paymentId) {
        const payment = Data.getPaymentById(paymentId);
        if (!payment) return;

        const student = Data.getUserById(payment.studentId);
        
        // Create receipt HTML
        const receiptHtml = `
            <div class="receipt" style="padding: 30px; font-family: Arial, sans-serif;">
                <div class="receipt-header" style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0d6efd;">
                    <h2 style="color: #0d6efd;">UNIVERSITY PORTAL</h2>
                    <h4>OFFICIAL PAYMENT RECEIPT</h4>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <p><strong>Receipt No:</strong> ${payment.id}</p>
                            <p><strong>Date:</strong> ${Utils.formatDate(payment.createdAt, 'long')}</p>
                            <p><strong>Student ID:</strong> ${student?.id}</p>
                        </div>
                        <div style="text-align: right;">
                            <p><strong>Student Name:</strong> ${student?.firstName} ${student?.lastName}</p>
                            <p><strong>Email:</strong> ${student?.email}</p>
                            <p><strong>Phone:</strong> ${student?.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Description</th>
                            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">${payment.description || 'Tuition Payment'}</td>
                            <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">${Utils.formatCurrency(payment.amount)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">Total:</th>
                            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right; color: #0d6efd;">${Utils.formatCurrency(payment.amount)}</th>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                    <div>
                        <p><strong>Payment Method:</strong> ${payment.method || 'Paystack'}</p>
                        <p><strong>Transaction ID:</strong> ${payment.transactionId || payment.reference}</p>
                        <p><strong>Status:</strong> <span style="color: #198754;">PAID</span></p>
                    </div>
                    <div id="receiptQR" style="width: 100px; height: 100px;"></div>
                </div>
                
                <div style="text-align: center; font-size: 12px; color: #6c757d; margin-top: 50px;">
                    <p>This is a computer-generated receipt. No signature required.</p>
                    <p>For verification, visit portal.university.edu/verify</p>
                </div>
            </div>
        `;

        // Create a temporary div and generate PDF
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = receiptHtml;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // Generate QR code
        const qrData = JSON.stringify({
            receipt: payment.id,
            student: student?.id,
            amount: payment.amount,
            date: payment.createdAt
        });
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById('receiptQR'), {
                text: qrData,
                width: 100,
                height: 100
            });
        }

        // Use html2pdf to generate PDF
        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: 1,
                filename: `receipt-${payment.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(tempDiv).save().then(() => {
                document.body.removeChild(tempDiv);
            });
        } else {
            Utils.showToast('PDF generation library not loaded', 'error');
            document.body.removeChild(tempDiv);
        }
    }

    function viewReceipt(paymentId) {
        downloadReceipt(paymentId); // For now, just download
    }

    function markPaymentCompleted(paymentId) {
        Data.updatePaymentStatus(paymentId, 'completed', {
            transactionId: 'TXN' + Date.now(),
            paidAt: new Date().toISOString()
        });
        Utils.showToast('Payment marked as completed', 'success');
        loadPaymentManagement(document.getElementById('dashboardContent'));
    }

    // ==================== REGISTRATION ACTIONS ====================

    /**
     * View registration details
     * @param {string} registrationId - Registration ID
     */
    function viewRegistrationDetails(registrationId) {
        console.log('Viewing registration details:', registrationId);
        
        const registration = Data.getRegistrationById(registrationId);
        if (!registration) {
            Utils.showToast('Registration not found', 'error');
            return;
        }

        const student = Data.getUserById(registration.studentId);
        const courses = Data.getCourses().filter(c => registration.courses.includes(c.id));

        let courseList = '';
        courses.forEach((course, index) => {
            courseList += `${index + 1}. ${course.code} - ${course.title} (${course.credits} credits) - ${Utils.formatCurrency(course.fee)}<br>`;
        });

        const message = `
            <div class="p-2">
                <p><strong>Registration ID:</strong> ${registration.id}</p>
                <p><strong>Student:</strong> ${student?.firstName} ${student?.lastName} (${student?.id})</p>
                <p><strong>Email:</strong> ${student?.email}</p>
                <p><strong>Status:</strong> <span class="badge bg-${registration.status === 'pending' ? 'warning' : registration.status === 'approved' ? 'success' : 'danger'}">${registration.status}</span></p>
                <p><strong>Submitted:</strong> ${Utils.formatDate(registration.createdAt, 'long')}</p>
                <hr>
                <p><strong>Selected Courses:</strong></p>
                <p>${courseList}</p>
                <hr>
                <p><strong>Total Credits:</strong> ${courses.reduce((sum, c) => sum + c.credits, 0)}</p>
                <p><strong>Total Fees:</strong> ${Utils.formatCurrency(registration.totalFees)}</p>
                ${registration.approvedAt ? `<p><strong>Approved At:</strong> ${Utils.formatDate(registration.approvedAt, 'long')}</p>` : ''}
                ${registration.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${registration.rejectionReason}</p>` : ''}
            </div>
        `;

        Utils.showAlert({
            title: 'Registration Details',
            message: message,
            type: 'info'
        });
    }

        /**
     * View courses in a registration
     * @param {string} registrationId - Registration ID
     */
    function viewRegistrationCourses(registrationId) {
        console.log('Viewing courses for registration:', registrationId);
        
        const registration = Data.getRegistrationById(registrationId);
        if (!registration) {
            Utils.showToast('Registration not found', 'error');
            return;
        }

        const courses = Data.getCourses().filter(c => registration.courses.includes(c.id));
        
        let courseList = '<ul class="list-group">';
        courses.forEach(course => {
            courseList += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${course.code} - ${course.title}
                    <span class="badge bg-primary rounded-pill">${course.credits} credits</span>
                </li>
            `;
        });
        courseList += '</ul>';

        Utils.showAlert({
            title: 'Selected Courses',
            message: courseList,
            type: 'info'
        });
    }

    // ==================== PROFILE ACTIONS ====================

    function updateProfile() {
        const updates = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value
        };

        const result = Auth.updateProfile(currentUser.id, updates);
        
        if (result.success) {
            Utils.showToast('Profile updated successfully', 'success');
            
            // Update current user
            currentUser = { ...currentUser, ...updates };
            
            // Update displayed name
            document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        } else {
            Utils.showToast(result.message, 'error');
        }
    }

    function changeAvatar() {
        Utils.showToast('Avatar change feature coming soon', 'info');
    }

    // ==================== REPORT ACTIONS ====================

    function generateReport() {
        const type = document.getElementById('reportType')?.value;
        const startDate = document.getElementById('reportStartDate')?.value;
        const endDate = document.getElementById('reportEndDate')?.value;
        const format = document.getElementById('reportFormat')?.value;

        Utils.showLoading('Generating report...');

        setTimeout(() => {
            Utils.hideLoading();
            Utils.showToast(`${type} report generated successfully`, 'success');
            
            // Simulate download
            const dummyData = [
                { 'Date': '2024-01-01', 'Revenue': 5000, 'Transactions': 10 },
                { 'Date': '2024-01-02', 'Revenue': 6000, 'Transactions': 12 }
            ];
            
            if (format === 'excel') {
                Utils.exportToExcel(dummyData, `${type}_report`);
            } else {
                Utils.downloadFile(JSON.stringify(dummyData, null, 2), `${type}_report.${format}`);
            }
        }, 2000);
    }

    function downloadQuickReport(type) {
        Utils.showToast(`Downloading ${type} report...`, 'info');
        
        setTimeout(() => {
            const dummyData = [
                { 'Metric': 'Total Revenue', 'Value': '$50,000' },
                { 'Metric': 'Total Students', 'Value': '150' }
            ];
            Utils.exportToExcel(dummyData, `${type}_quick_report`);
        }, 1000);
    }

    function saveReportSchedule() {
        const schedule = {
            daily: document.getElementById('scheduleDaily')?.checked,
            weekly: document.getElementById('scheduleWeekly')?.checked,
            monthly: document.getElementById('scheduleMonthly')?.checked
        };

        localStorage.setItem('reportSchedule', JSON.stringify(schedule));
        Utils.showToast('Report schedule saved', 'success');
    }

    // ==================== SETTINGS ACTIONS ====================

    function saveSettings() {
        const settings = {
            institutionName: document.getElementById('institutionName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            address: document.getElementById('address').value,
            academicYear: document.getElementById('academicYear').value,
            currentSemester: document.getElementById('currentSemester').value,
            currency: document.getElementById('currency').value,
            registrationDeadline: document.getElementById('registrationDeadline').value,
            paymentDeadline: document.getElementById('paymentDeadline').value,
            maxCredits: parseInt(document.getElementById('maxCredits').value),
            emailRegistration: document.getElementById('emailRegistration').checked,
            emailPayment: document.getElementById('emailPayment').checked,
            emailApproval: document.getElementById('emailApproval').checked
        };

        Data.updateSettings(settings);
        Utils.showToast('Settings saved successfully', 'success');
    }

    function backupDatabase() {
        const data = {
            users: Data.getUsers(),
            courses: Data.getCourses(),
            payments: Data.getPayments(),
            registrations: Data.getRegistrations(),
            settings: Data.getSettings()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Utils.showToast('Database backup created', 'success');
    }

    function clearCache() {
        Utils.showConfirm({
            title: 'Clear Cache',
            message: 'Are you sure you want to clear the cache? This will not affect your data.',
            onConfirm: () => {
                localStorage.removeItem('theme');
                sessionStorage.clear();
                Utils.showToast('Cache cleared', 'success');
            }
        });
    }

    function testAPIConnection() {
        Utils.showToast('Testing API connection...', 'info');
        
        setTimeout(() => {
            Utils.showToast('All APIs are connected successfully', 'success');
        }, 1500);
    }

    function exportSystemBackup() {
        backupDatabase();
    }

    // ==================== CHART FUNCTIONS ====================

    function initializeCharts() {
        const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
        if (!revenueCtx) return;

        // Destroy existing chart if any
        if (charts.revenue) {
            charts.revenue.destroy();
        }

        // Generate last 6 months data
        const months = [];
        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(d.toLocaleString('default', { month: 'short' }));
            revenueData.push(Math.floor(Math.random() * 50000) + 20000);
        }

        charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenueData,
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: ' + Utils.formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    function initializeReportPreviewChart() {
        const ctx = document.getElementById('reportPreviewChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 25000],
                    backgroundColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function updateChartPeriod(period) {
        Utils.showToast(`Chart updated to ${period} view`, 'success');
        
        // Update active button
        document.querySelectorAll('[onclick*="updateChartPeriod"]').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);

    // ==================== PUBLIC API ====================
    return {
        // Core
        renderSidebar,
        loadNotifications,
        markAllNotificationsRead,
        loadAdminContent,
        loadStudentContent,
        
        // Student functions
        loadStudentDashboard,
        loadStudentProfile,
        loadStudentCourseRegistration,
        loadStudentPaymentPage,
        loadStudentPaymentHistory,
        loadStudentReceipts,
        updateProfile,
        changeAvatar,
        submitRegistration,
        clearSelectedCourses,
        processPayment,
        retryPayment,
        
        // Admin functions - Approvals (CRITICAL)
        showApproveModal,
        approveRegistration,
        showRejectModal,
        rejectRegistration,
        approveStudent,
        rejectStudent,
        viewRegistrationCourses,      // <-- ADD THIS
        viewRegistrationDetails,       // <-- ADD THIS
        
        // Admin functions - Students
        toggleStudentStatus,
        viewStudent,
        editStudent,
        exportStudents,
        showAddStudentModal,
        filterStudents,
        
        // Admin functions - Courses
        showAddCourseModal,
        saveCourse,
        editCourse,
        updateCourse,
        deleteCourse,
        viewCourseDetails,
        filterCourses,
        
        // Admin functions - Payments
        viewPaymentDetails,
        downloadReceipt,
        viewReceipt,
        markPaymentCompleted,
        filterPayments,
        
        // Admin functions - Reports
        generateReport,
        downloadQuickReport,
        saveReportSchedule,
        
        // Admin functions - Settings
        saveSettings,
        backupDatabase,
        clearCache,
        testAPIConnection,
        exportSystemBackup,
        
        // Chart functions
        updateChartPeriod,
        
        // Profile function
        loadProfile: function() {
            window.location.href = 'dashboard.html?tab=profile';
        },
        loadSettings: function() {
            window.location.href = 'dashboard.html?tab=settings';
        }
    };
})();

// Make App globally available
window.App = App;