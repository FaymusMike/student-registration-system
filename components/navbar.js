// Navbar Component

const Navbar = (function() {
    function render(options = {}) {
        const { title = 'Dashboard', showSearch = true, showNotifications = true } = options;

        return `
            <nav class="navbar navbar-expand-lg navbar-light bg-white mb-4">
                <div class="container-fluid">
                    <button class="btn btn-outline-primary d-lg-none" id="sidebarToggle">
                        <i class="fas fa-bars"></i>
                    </button>
                    
                    <h4 class="mb-0 d-none d-md-block">${title}</h4>
                    
                    <div class="ms-auto d-flex align-items-center">
                        ${showSearch ? `
                            <div class="search-box me-3 d-none d-md-block">
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0">
                                        <i class="fas fa-search text-muted"></i>
                                    </span>
                                    <input type="text" 
                                           class="form-control border-start-0" 
                                           placeholder="Search..." 
                                           id="globalSearch">
                                </div>
                            </div>
                        ` : ''}
                        
                        <button class="btn btn-outline-secondary me-2" onclick="App.toggleDarkMode()">
                            <i class="fas fa-moon"></i>
                        </button>
                        
                        ${showNotifications ? `
                            <div class="dropdown me-2">
                                <button class="btn btn-outline-primary position-relative" 
                                        type="button" 
                                        data-bs-toggle="dropdown">
                                    <i class="fas fa-bell"></i>
                                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        3
                                        <span class="visually-hidden">unread notifications</span>
                                    </span>
                                </button>
                                <div class="dropdown-menu dropdown-menu-end notifications-dropdown">
                                    <h6 class="dropdown-header">Notifications</h6>
                                    <div class="notification-item dropdown-item">
                                        <small class="text-muted">5 min ago</small>
                                        <p class="mb-0">Payment received: $500.00</p>
                                    </div>
                                    <div class="dropdown-divider"></div>
                                    <div class="notification-item dropdown-item">
                                        <small class="text-muted">1 hour ago</small>
                                        <p class="mb-0">Course registration approved</p>
                                    </div>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" class="dropdown-item text-center">View all</a>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="dropdown">
                            <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center" 
                                    type="button" 
                                    data-bs-toggle="dropdown">
                                <img id="navAvatar" 
                                     src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
                                     alt="Avatar" 
                                     class="rounded-circle me-2" 
                                     width="30" 
                                     height="30">
                                <span id="navUserName">User</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="/pages/profile.html">
                                    <i class="fas fa-user me-2"></i>Profile
                                </a></li>
                                <li><a class="dropdown-item" href="/pages/settings.html">
                                    <i class="fas fa-cog me-2"></i>Settings
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="Auth.logout()">
                                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    function updateUserInfo() {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const nameEl = document.getElementById('navUserName');
        const avatarEl = document.getElementById('navAvatar');

        if (nameEl) nameEl.textContent = user.firstName;
        if (avatarEl) avatarEl.src = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    }

    function init() {
        updateUserInfo();
        
        // Setup global search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(function(e) {
                const query = e.target.value.toLowerCase();
                if (query.length > 2) {
                    performGlobalSearch(query);
                }
            }, 500));
        }
    }

    function performGlobalSearch(query) {
        // Implement global search functionality
        console.log('Searching for:', query);
    }

    return {
        render,
        init,
        updateUserInfo
    };
})();