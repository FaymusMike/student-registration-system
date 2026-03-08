// Authentication Module with Session Management

const Auth = (function() {
    // Password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        const requirements = [];
        
        if (password.length >= 8) {
            strength += 25;
        } else {
            requirements.push('At least 8 characters');
        }
        
        if (/[A-Z]/.test(password)) {
            strength += 25;
        } else {
            requirements.push('One uppercase letter');
        }
        
        if (/[a-z]/.test(password)) {
            strength += 25;
        } else {
            requirements.push('One lowercase letter');
        }
        
        if (/[0-9]/.test(password)) {
            strength += 15;
        } else {
            requirements.push('One number');
        }
        
        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 10;
        } else {
            requirements.push('One special character');
        }
        
        let level = 'weak';
        let color = 'danger';
        
        if (strength >= 80) {
            level = 'strong';
            color = 'success';
        } else if (strength >= 60) {
            level = 'medium';
            color = 'warning';
        }
        
        return {
            strength,
            level,
            color,
            requirements,
            isValid: strength >= 60
        };
    }

    // Email validation using external API
    async function validateEmail(email) {
        try {
            // Simulate API call - in production, use actual email validation API
            const response = await fetch(`https://api.emailvalidation.com/v1/validate?email=${email}`);
            // For demo, we'll simulate validation
            return {
                valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                format: 'valid',
                domain: email.split('@')[1],
                disposable: false
            };
        } catch (error) {
            console.error('Email validation error:', error);
            // Fallback to basic validation
            return {
                valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                format: 'valid',
                error: 'API unavailable, using basic validation'
            };
        }
    }

    // Login function
    async function login(email, password) {
        try {
            const users = Storage.getUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            
            // Simple password check (in production, use proper hashing)
            if (btoa(password) !== user.password) {
                return {
                    success: false,
                    message: 'Invalid password'
                };
            }
            
            if (user.status === 'pending' && user.role === 'student') {
                return {
                    success: false,
                    message: 'Account pending approval'
                };
            }
            
            // Create session
            const session = Storage.createSession(user);
            
            return {
                success: true,
                message: 'Login successful',
                user,
                session,
                redirect: user.role === 'admin' ? '/admin.html' : '/student-dashboard.html'
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed. Please try again.'
            };
        }
    }

    // Logout function
    function logout() {
        Storage.destroySession();
        window.location.href = '/login.html';
    }

    // Register new student
    async function registerStudent(userData) {
        try {
            // Validate email
            const emailValidation = await validateEmail(userData.email);
            if (!emailValidation.valid) {
                return {
                    success: false,
                    message: 'Invalid email address'
                };
            }
            
            // Check if email already exists
            const existingUser = Storage.getUserByEmail(userData.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already registered'
                };
            }
            
            // Check password strength
            const passwordCheck = checkPasswordStrength(userData.password);
            if (!passwordCheck.isValid) {
                return {
                    success: false,
                    message: 'Password is too weak',
                    requirements: passwordCheck.requirements
                };
            }
            
            // Create user
            const newUser = Storage.createUser(userData);
            
            return {
                success: true,
                message: 'Registration successful! Please wait for admin approval.',
                user: newUser
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed. Please try again.'
            };
        }
    }

    // Check authentication status
    function checkAuth(requiredRole = null) {
        const session = Storage.getSession();
        
        if (!session) {
            window.location.href = '/login.html';
            return false;
        }
        
        if (requiredRole && session.role !== requiredRole) {
            window.location.href = '/unauthorized.html';
            return false;
        }
        
        return true;
    }

    // Get current user
    function getCurrentUser() {
        const session = Storage.getSession();
        if (!session) return null;
        
        return Storage.getUserById(session.userId);
    }

    // Update profile
    function updateProfile(userId, profileData) {
        try {
            const updatedUser = Storage.updateUser(userId, profileData);
            return {
                success: true,
                message: 'Profile updated successfully',
                user: updatedUser
            };
        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                message: 'Failed to update profile'
            };
        }
    }

    return {
        checkPasswordStrength,
        validateEmail,
        login,
        logout,
        registerStudent,
        checkAuth,
        getCurrentUser,
        updateProfile
    };
})();