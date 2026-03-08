// Sidebar Component

const Sidebar = (function() {
    function render(role = 'student') {
        const menuItems = {
            student: [
                { icon: 'fa-home', text: 'Dashboard', link: '/student-dashboard.html', active: true },
                { icon: 'fa-user', text: 'My Profile', link: '/pages/profile.html' },
                { icon: 'fa-book', text: 'Course Registration', link: '/pages/courses.html' },
                { icon: 'fa-credit-card', text: 'Payments', link: '/pages/payments.html' },
                { icon: 'fa-history', text: 'Payment History', link: '/pages/payments.html?tab=history' },
                { icon: 'fa-download', text: 'Receipts', link: '/pages/payments.html?tab=receipts' },
                { icon: 'fa-cog', text: 'Settings', link: '/pages/profile.html?tab=settings' }
            ],
            admin: [
                { icon: 'fa-home', text: 'Dashboard', link: '/admin.html', active: true },
                { icon: 'fa-users', text: 'Students', link: '/admin.html#students' },
                { icon: 'fa-book', text: 'Courses', link: '/admin.html#courses' },
                { icon: 'fa-credit-card', text: 'Payments', link: '/admin.html#payments' },
                { icon: 'fa-user-plus', text: 'Approvals', link: '/admin.html#registrations' },
                { icon: 'fa-chart-bar', text: 'Reports', link: '/admin.html#reports' },
                { icon: 'fa-cog', text: 'Settings', link: '/pages/settings.html' }
            ]
        };

        const items = menuItems[role] || menuItems.student;

        return `
            <div class="sidebar">
                <div class="sidebar-header p-3">
                    <a href="/" class="text-decoration-none">
                        <i class="fas fa-university fa-2x text-primary"></i>
                        <h5 class="mt-2">UniPortal</h5>
                    </a>
                </div>
                
                <div class="sidebar-user p-3 border-top border-bottom">
                    <div class="d-flex align-items-center">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}" 
                             alt="User" 
                             class="rounded-circle me-2" 
                             width="40" 
                             height="40"
                             id="sidebarAvatar">
                        <div class="user-info">
                            <div class="fw-bold" id="sidebarUserName">Loading...</div>
                            <small class="text-muted" id="sidebarUserRole">${role}</small>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-menu p-3">
                    <ul class="nav flex-column">
                        ${items.map(item => `
                            <li class="nav-item mb-2">
                                <a class="nav-link ${item.active ? 'active' : ''}" 
                                   href="${item.link}"
                                   onclick="Sidebar.handleNavigation(event, '${item.link}')">
                                    <i class="fas ${item.icon} me-3"></i>
                                    ${item.text}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="sidebar-footer p-3 border-top">
                    <button class="btn btn-outline-danger w-100" onclick="Auth.logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                </div>
            </div>
        `;
    }

    function handleNavigation(event, link) {
        // Remove active class from all nav links
        document.querySelectorAll('.sidebar .nav-link').forEach(el => {
            el.classList.remove('active');
        });
        
        // Add active class to clicked link
        event.target.closest('.nav-link').classList.add('active');
    }

    function updateUserInfo() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const nameEl = document.getElementById('sidebarUserName');
        const avatarEl = document.getElementById('sidebarAvatar');
        const roleEl = document.getElementById('sidebarUserRole');

        if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
        if (avatarEl) avatarEl.src = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
        if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrator' : 'Student';
    }

    // Initialize sidebar after render
    function init() {
        updateUserInfo();
        
        // Set active menu based on current page
        const currentPath = window.location.pathname;
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    return {
        render,
        handleNavigation,
        init
    };
})();

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.sidebar')) {
        Sidebar.init();
    }
});