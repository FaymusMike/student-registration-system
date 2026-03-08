/**
 * UniPortal - Authentication Module
 * Handles login, registration, and session management
 */

const Auth = (function() {
    // ==================== AUTHENTICATION ====================

    /**
     * Login user
     */
    async function login(email, password) {
        try {
            Utils.showLoading('Authenticating...');
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const users = Data.getUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                Utils.hideLoading();
                return { success: false, message: 'User not found' };
            }
            
            // Check password (demo only - use proper hashing)
            if (btoa(password) !== user.password) {
                Utils.hideLoading();
                return { success: false, message: 'Invalid password' };
            }
            
            if (user.status === 'pending') {
                Utils.hideLoading();
                return { success: false, message: 'Account pending approval' };
            }
            
            if (user.status === 'suspended') {
                Utils.hideLoading();
                return { success: false, message: 'Account suspended' };
            }
            
            // Create session
            const session = Data.createSession(user);
            Utils.hideLoading();
            
            return {
                success: true,
                message: 'Login successful',
                user,
                session,
                redirect: user.role === 'admin' ? 'dashboard.html?admin' : 'dashboard.html'
            };
            
        } catch (error) {
            Utils.hideLoading();
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    }

    /**
     * Register new student
     */
    async function register(userData) {
        try {
            Utils.showLoading('Creating account...');
            
            // Validate email
            const emailValid = await Utils.validateEmail(userData.email);
            if (!emailValid.valid) {
                Utils.hideLoading();
                return { success: false, message: 'Invalid email address' };
            }
            
            // Check if email exists
            const existingUser = Data.getUserByEmail(userData.email);
            if (existingUser) {
                Utils.hideLoading();
                return { success: false, message: 'Email already registered' };
            }
            
            // Check password strength
            const passwordCheck = Utils.checkPasswordStrength(userData.password);
            if (!passwordCheck.isValid) {
                Utils.hideLoading();
                return {
                    success: false,
                    message: 'Password too weak',
                    feedback: passwordCheck.feedback
                };
            }
            
            // Create user
            const newUser = Data.createUser(userData);
            
            Utils.hideLoading();
            Utils.showToast('Registration successful! Please wait for admin approval.', 'success');
            
            return {
                success: true,
                message: 'Registration successful',
                user: newUser
            };
            
        } catch (error) {
            Utils.hideLoading();
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed' };
        }
    }

    /**
     * Logout user
     */
    function logout() {
        Data.destroySession();
        window.location.href = 'login.html';
    }

    /**
     * Get current user
     */
    function getCurrentUser() {
        const session = Data.getSession();
        if (!session) return null;
        
        return Data.getUserById(session.userId);
    }

    /**
     * Check authentication
     */
    function checkAuth(requiredRole = null) {
        const session = Data.getSession();
        
        if (!session) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (requiredRole && session.role !== requiredRole) {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }

    // Public API
    return {
        login,
        register,
        logout,
        getCurrentUser,
        checkAuth
    };
})();

// Make auth globally available
window.Auth = Auth;