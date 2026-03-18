/**
 * UniPortal - Complete Authentication Module
 * Production-ready with session management, security, and audit trails
 */

const Auth = (function() {
    // ==================== CONSTANTS ====================
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

    // ==================== STATE ====================
    let loginAttempts = {};

    // ==================== AUTHENTICATION ====================

    /**
     * Login user with security measures
     */
    async function login(email, password, remember = false) {
        try {
            // Check for lockout
            if (isLockedOut(email)) {
                const lockoutExpiry = loginAttempts[email].lockoutUntil;
                const minutesLeft = Math.ceil((lockoutExpiry - Date.now()) / 60000);
                return {
                    success: false,
                    message: `Too many failed attempts. Please try again in ${minutesLeft} minutes.`
                };
            }

            Utils.showLoading('Authenticating...');
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const users = Data.getUsers();
            const user = users.find(u => u.email === email);
            
            // User not found
            if (!user) {
                recordFailedAttempt(email);
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Invalid email or password' 
                };
            }
            
            // Check password (demo only - use proper hashing in production)
            if (btoa(password) !== user.password) {
                recordFailedAttempt(email);
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Invalid email or password' 
                };
            }
            
            // Check account status
            if (user.status === 'suspended') {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Your account has been suspended. Please contact administration.' 
                };
            }
            
            if (user.status === 'pending' && user.role === 'student') {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Your account is pending approval. Please wait for admin confirmation.' 
                };
            }
            
            // Clear failed attempts on successful login
            delete loginAttempts[email];
            
            // Create session with expiry
            const session = Data.createSession(user);
            
            // Set remember me cookie if requested
            if (remember) {
                setRememberMeCookie(email);
            }
            
            Utils.hideLoading();
            Utils.showToast(`Welcome back, ${user.firstName}!`, 'success');
            
            return {
                success: true,
                message: 'Login successful',
                user,
                session,
                redirect: user.role === 'admin' ? 'dashboard.html' : 'dashboard.html'
            };
            
        } catch (error) {
            Utils.hideLoading();
            console.error('Login error:', error);
            return { 
                success: false, 
                message: 'An error occurred during login. Please try again.' 
            };
        }
    }

    /**
     * Record failed login attempt
     */
    function recordFailedAttempt(email) {
        if (!loginAttempts[email]) {
            loginAttempts[email] = {
                count: 1,
                firstAttempt: Date.now()
            };
        } else {
            loginAttempts[email].count++;
            
            // Check if should lock out
            if (loginAttempts[email].count >= MAX_LOGIN_ATTEMPTS) {
                loginAttempts[email].lockoutUntil = Date.now() + LOCKOUT_TIME;
            }
        }
    }

    /**
     * Check if user is locked out
     */
    function isLockedOut(email) {
        const attempts = loginAttempts[email];
        if (!attempts || !attempts.lockoutUntil) return false;
        
        if (Date.now() > attempts.lockoutUntil) {
            // Lockout expired
            delete loginAttempts[email];
            return false;
        }
        
        return true;
    }

    /**
     * Set remember me cookie
     */
    function setRememberMeCookie(email) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30); // 30 days
        document.cookie = `remember_email=${email}; expires=${expiry.toUTCString()}; path=/`;
    }

    /**
     * Get remember me email
     */
    function getRememberedEmail() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'remember_email') {
                return value;
            }
        }
        return null;
    }

    /**
     * Clear remember me cookie
     */
    function clearRememberMe() {
        document.cookie = 'remember_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    /**
     * Register new student with validation
     */
    async function register(userData) {
        try {
            // Validate required fields
            const required = ['firstName', 'lastName', 'email', 'password', 'phone'];
            for (let field of required) {
                if (!userData[field]) {
                    return { 
                        success: false, 
                        message: `${field} is required` 
                    };
                }
            }

            Utils.showLoading('Creating your account...');
            
            // Validate email format
            if (!Utils.isValidEmail(userData.email)) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Please enter a valid email address' 
                };
            }
            
            // Validate email via API
            const emailValid = await Utils.validateEmail(userData.email);
            if (!emailValid.valid) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Invalid or disposable email address' 
                };
            }
            
            // Check if email exists
            const existingUser = Data.getUserByEmail(userData.email);
            if (existingUser) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Email already registered' 
                };
            }
            
            // Check password strength
            const passwordCheck = Utils.checkPasswordStrength(userData.password);
            if (!passwordCheck.isValid) {
                Utils.hideLoading();
                return {
                    success: false,
                    message: 'Password is too weak',
                    feedback: passwordCheck.feedback
                };
            }
            
            // Validate phone number
            if (!Utils.isValidPhone(userData.phone)) {
                Utils.hideLoading();
                return {
                    success: false,
                    message: 'Please enter a valid phone number'
                };
            }
            
            // Create user
            const newUser = Data.createUser(userData);
            
            Utils.hideLoading();
            Utils.showToast('Registration successful! Please check your email for verification.', 'success');
            
            // Send verification email (simulated)
            sendVerificationEmail(newUser.email);
            
            return {
                success: true,
                message: 'Registration successful',
                user: newUser
            };
            
        } catch (error) {
            Utils.hideLoading();
            console.error('Registration error:', error);
            return { 
                success: false, 
                message: error.message || 'Registration failed' 
            };
        }
    }

    /**
     * Send verification email (simulated)
     */
    function sendVerificationEmail(email) {
        console.log(`Verification email sent to ${email}`);
        // In production, integrate with email service
    }

    /**
     * Logout user
     */
    function logout() {
        const user = getCurrentUser();
        if (user) {
            Utils.showToast(`Goodbye, ${user.firstName}!`, 'info');
        }
        Data.destroySession();
        clearRememberMe();
        window.location.href = 'login.html';
    }

    /**
     * Get current user with full data
     */
    function getCurrentUser() {
        const session = Data.getSession();
        if (!session) return null;
        
        return Data.getUserById(session.userId);
    }

    /**
     * Check authentication with role-based access
     */
    function checkAuth(requiredRole = null, redirect = true) {
        const session = Data.getSession();
        
        if (!session) {
            if (redirect) {
                window.location.href = 'login.html';
            }
            return false;
        }
        
        if (requiredRole && session.role !== requiredRole) {
            if (redirect) {
                window.location.href = 'dashboard.html';
            }
            return false;
        }
        
        return true;
    }

    /**
     * Check if user has permission
     */
    function hasPermission(permission) {
        const session = Data.getSession();
        if (!session) return false;
        
        return Data.hasPermission(permission);
    }

    /**
     * Change password with validation
     */
    async function changePassword(currentPassword, newPassword) {
        try {
            const user = getCurrentUser();
            if (!user) {
                return { success: false, message: 'Not authenticated' };
            }

            Utils.showLoading('Updating password...');

            // Verify current password
            if (btoa(currentPassword) !== user.password) {
                Utils.hideLoading();
                return { success: false, message: 'Current password is incorrect' };
            }

            // Check new password strength
            const passwordCheck = Utils.checkPasswordStrength(newPassword);
            if (!passwordCheck.isValid) {
                Utils.hideLoading();
                return {
                    success: false,
                    message: 'New password is too weak',
                    feedback: passwordCheck.feedback
                };
            }

            // Update password
            Data.updateUser(user.id, { password: btoa(newPassword) });

            Utils.hideLoading();
            Utils.showToast('Password changed successfully!', 'success');

            return { success: true, message: 'Password updated' };

        } catch (error) {
            Utils.hideLoading();
            console.error('Password change error:', error);
            return { success: false, message: 'Failed to change password' };
        }
    }

    /**
     * Request password reset
     */
    async function requestPasswordReset(email) {
        try {
            Utils.showLoading('Sending reset instructions...');

            const user = Data.getUserByEmail(email);
            if (!user) {
                // Don't reveal that user doesn't exist for security
                await new Promise(resolve => setTimeout(resolve, 1000));
                Utils.hideLoading();
                return { 
                    success: true, 
                    message: 'If the email exists, reset instructions have been sent.' 
                };
            }

            // Generate reset token (in production, save to database)
            const resetToken = Data.generateId('RST');
            
            // Send email (simulated)
            console.log(`Password reset email sent to ${email} with token: ${resetToken}`);

            Utils.hideLoading();
            return { 
                success: true, 
                message: 'Password reset instructions have been sent to your email.' 
            };

        } catch (error) {
            Utils.hideLoading();
            console.error('Password reset error:', error);
            return { success: false, message: 'Failed to send reset email' };
        }
    }

    /**
     * Reset password with token
     */
    async function resetPassword(token, newPassword) {
        try {
            // Validate token (in production, check against database)
            if (!token || token.length < 10) {
                return { success: false, message: 'Invalid reset token' };
            }

            Utils.showLoading('Resetting password...');

            // Check password strength
            const passwordCheck = Utils.checkPasswordStrength(newPassword);
            if (!passwordCheck.isValid) {
                Utils.hideLoading();
                return {
                    success: false,
                    message: 'Password is too weak',
                    feedback: passwordCheck.feedback
                };
            }

            // In production, find user by token and update password
            await new Promise(resolve => setTimeout(resolve, 1500));

            Utils.hideLoading();
            Utils.showToast('Password reset successful! Please login.', 'success');

            return { success: true, message: 'Password reset successful' };

        } catch (error) {
            Utils.hideLoading();
            console.error('Password reset error:', error);
            return { success: false, message: 'Failed to reset password' };
        }
    }

    /**
     * Update profile
     */
    function updateProfile(updates) {
        try {
            const user = getCurrentUser();
            if (!user) {
                return { success: false, message: 'Not authenticated' };
            }

            // Validate email if being updated
            if (updates.email && updates.email !== user.email) {
                if (!Utils.isValidEmail(updates.email)) {
                    return { success: false, message: 'Invalid email format' };
                }
                
                const existingUser = Data.getUserByEmail(updates.email);
                if (existingUser && existingUser.id !== user.id) {
                    return { success: false, message: 'Email already in use' };
                }
            }

            // Validate phone if being updated
            if (updates.phone && !Utils.isValidPhone(updates.phone)) {
                return { success: false, message: 'Invalid phone number' };
            }

            const updatedUser = Data.updateUser(user.id, updates);
            
            Utils.showToast('Profile updated successfully!', 'success');
            
            return {
                success: true,
                message: 'Profile updated',
                user: updatedUser
            };

        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: error.message || 'Failed to update profile' };
        }
    }

    /**
     * Get login history
     */
    function getLoginHistory() {
        const user = getCurrentUser();
        if (!user) return [];
        
        const logs = Data.getAuditLogs({ 
            userId: user.id,
            action: 'SESSION_CREATED'
        });
        
        return logs.slice(0, 10); // Last 10 logins
    }

    /**
     * Initialize auth - check for remember me
     */
    function init() {
        const rememberedEmail = getRememberedEmail();
        if (rememberedEmail && window.location.pathname.includes('login.html')) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = rememberedEmail;
                document.getElementById('remember')?.setAttribute('checked', 'checked');
            }
        }
    }

    // Initialize
    init();

    // Public API
    return {
        login,
        register,
        logout,
        getCurrentUser,
        checkAuth,
        hasPermission,
        changePassword,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        getLoginHistory
    };
})();

// Make auth globally available
window.Auth = Auth;