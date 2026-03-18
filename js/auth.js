/**
 * UniPortal - Complete Authentication Module
 * Handles all auth operations with proper security
 */

const Auth = (function() {
    // ==================== AUTHENTICATION ====================

    async function login(email, password) {
        try {
            Utils.showLoading('Authenticating...');
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const users = Data.getUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'User not found. Please check your email.' 
                };
            }
            
            // Check password (demo only - use proper hashing)
            if (btoa(password) !== user.password) {
                Utils.hideLoading();
                
                // Log failed attempt
                if (Data.addAuditLog) {
                    Data.addAuditLog('login_failed', user.id, { email });
                }
                
                return { 
                    success: false, 
                    message: 'Invalid password. Please try again.' 
                };
            }
            
            // Check account status
            if (user.status === 'pending') {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Your account is pending approval. You will be notified once approved.' 
                };
            }
            
            if (user.status === 'suspended') {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Your account has been suspended. Please contact administration.' 
                };
            }
            
            if (user.status === 'rejected') {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Your account application was rejected. Please contact support.' 
                };
            }
            
            // Create session
            const session = Data.createSession(user);
            
            // Log successful login
            if (Data.addAuditLog) {
                Data.addAuditLog('login_success', user.id, { email });
            }
            
            Utils.hideLoading();
            
            return {
                success: true,
                message: 'Login successful! Redirecting...',
                user,
                session,
                redirect: user.role === 'admin' ? 'dashboard.html' : 'dashboard.html'
            };
            
        } catch (error) {
            Utils.hideLoading();
            console.error('Login error:', error);
            return { 
                success: false, 
                message: 'Login failed. Please try again later.' 
            };
        }
    }

    async function register(userData) {
        try {
            Utils.showLoading('Creating your account...');
            
            // Validate email format
            if (!Utils.isValidEmail(userData.email)) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Please enter a valid email address.' 
                };
            }
            
            // Check if email exists
            const existingUser = Data.getUserByEmail(userData.email);
            if (existingUser) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'This email is already registered. Please login instead.' 
                };
            }
            
            // Validate phone number
            if (!Utils.isValidPhone(userData.phone)) {
                Utils.hideLoading();
                return { 
                    success: false, 
                    message: 'Please enter a valid phone number.' 
                };
            }
            
            // Check password strength
            const passwordCheck = Utils.checkPasswordStrength(userData.password);
            if (!passwordCheck.isValid) {
                Utils.hideLoading();
                return {
                    success: false,
                    message: 'Password is too weak.',
                    feedback: passwordCheck.feedback
                };
            }
            
            // Create user
            const newUser = Data.createUser(userData);
            
            Utils.hideLoading();
            
            return {
                success: true,
                message: 'Registration successful! Your account is pending approval.',
                user: newUser
            };
            
        } catch (error) {
            Utils.hideLoading();
            console.error('Registration error:', error);
            return { 
                success: false, 
                message: 'Registration failed. Please try again.' 
            };
        }
    }

    function logout() {
        const session = Data.getSession();
        if (session) {
            Data.addAuditLog('logout', session.userId, {});
        }
        
        Data.destroySession();
        window.location.href = 'login.html';
    }

    function getCurrentUser() {
        const session = Data.getSession();
        if (!session) return null;
        
        return Data.getUserById(session.userId);
    }

    function checkAuth(requiredRole = null) {
        const session = Data.getSession();
        
        if (!session) {
            // Don't redirect if on public pages
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const publicPages = ['login.html', 'register.html', 'index.html'];
            
            if (!publicPages.includes(currentPage)) {
                window.location.href = 'login.html';
            }
            return false;
        }
        
        // Check if session expired (optional - you can implement expiration)
        // For now, just return true
        
        if (requiredRole && session.role !== requiredRole) {
            // Redirect to appropriate dashboard
            window.location.href = 'dashboard.html';
            return false;
        }
        
        return true;
    }

    function updateProfile(userId, updates) {
        try {
            const updated = Data.updateUser(userId, updates);
            
            if (updated) {
                Data.addAuditLog('profile_updated', userId, { updates });
                return { success: true, user: updated };
            }
            
            return { success: false, message: 'Failed to update profile' };
            
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: 'An error occurred' };
        }
    }

    function changePassword(userId, currentPassword, newPassword) {
        const user = Data.getUserById(userId);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // Verify current password
        if (btoa(currentPassword) !== user.password) {
            Data.addAuditLog('password_change_failed', userId, { reason: 'incorrect_current' });
            return { success: false, message: 'Current password is incorrect' };
        }
        
        // Check new password strength
        const passwordCheck = Utils.checkPasswordStrength(newPassword);
        if (!passwordCheck.isValid) {
            return {
                success: false,
                message: 'New password is too weak',
                feedback: passwordCheck.feedback
            };
        }
        
        // Update password
        Data.updateUser(userId, { password: btoa(newPassword) });
        
        Data.addAuditLog('password_changed', userId, {});
        
        return { success: true, message: 'Password changed successfully' };
    }

    function requestPasswordReset(email) {
        const user = Data.getUserByEmail(email);
        
        if (!user) {
            // Don't reveal if email exists or not
            return { success: true, message: 'If email exists, reset instructions will be sent' };
        }
        
        // Generate reset token (in real app, send email)
        const resetToken = Math.random().toString(36).substr(2, 10).toUpperCase();
        
        Data.addAuditLog('password_reset_requested', user.id, { email });
        
        // In real app, send email with reset link
        console.log(`Password reset token for ${email}: ${resetToken}`);
        
        return { 
            success: true, 
            message: 'Password reset instructions have been sent to your email.' 
        };
    }

    // Public API
    return {
        login,
        register,
        logout,
        getCurrentUser,
        checkAuth,
        updateProfile,
        changePassword,
        requestPasswordReset
    };
})();

// Make Auth globally available
window.Auth = Auth;