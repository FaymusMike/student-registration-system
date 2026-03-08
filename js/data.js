/**
 * UniPortal - Data Management Module
 * Handles all localStorage operations with a unified API
 */

const Data = (function() {
    // ==================== STORAGE KEYS ====================
    const STORAGE_KEYS = {
        USERS: 'uniportal_users',
        COURSES: 'uniportal_courses',
        PAYMENTS: 'uniportal_payments',
        REGISTRATIONS: 'uniportal_registrations',
        SESSION: 'uniportal_session'
    };

    // ==================== INITIALIZATION ====================

    /**
     * Initialize database with default data
     */
    function initializeData() {
        // Initialize users
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 'ADMIN001',
                    email: 'admin@uniportal.edu',
                    password: btoa('Admin@123'), // Base64 for demo only
                    role: 'admin',
                    firstName: 'System',
                    lastName: 'Administrator',
                    status: 'active',
                    avatar: Utils.generateAvatar('admin'),
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        }

        // Initialize courses
        if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
            const defaultCourses = [
                {
                    id: 'CRS101',
                    code: 'CS101',
                    title: 'Introduction to Computer Science',
                    credits: 3,
                    fee: 500,
                    department: 'Computer Science',
                    description: 'Fundamentals of programming',
                    instructor: 'Dr. Smith',
                    schedule: 'Mon/Wed 10:00-11:30',
                    available: true
                },
                {
                    id: 'CRS102',
                    code: 'MATH201',
                    title: 'Calculus I',
                    credits: 4,
                    fee: 600,
                    department: 'Mathematics',
                    description: 'Differential and integral calculus',
                    instructor: 'Prof. Johnson',
                    schedule: 'Tue/Thu 13:00-14:30',
                    available: true
                },
                {
                    id: 'CRS103',
                    code: 'PHY101',
                    title: 'Physics Fundamentals',
                    credits: 3,
                    fee: 550,
                    department: 'Physics',
                    description: 'Introduction to mechanics',
                    instructor: 'Dr. Williams',
                    schedule: 'Mon/Wed/Fri 09:00-10:00',
                    available: true
                }
            ];
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
        }

        // Initialize other collections
        if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
        }

        if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
        }
    }

    // ==================== USER OPERATIONS ====================

    /**
     * Get all users
     */
    function getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    /**
     * Get user by ID
     */
    function getUserById(userId) {
        return getUsers().find(u => u.id === userId);
    }

    /**
     * Get user by email
     */
    function getUserByEmail(email) {
        return getUsers().find(u => u.email === email);
    }

    /**
     * Create new user
     */
    function createUser(userData) {
        const users = getUsers();
        const newUser = {
            ...userData,
            id: 'STU' + Date.now(),
            password: btoa(userData.password), // Demo only - use proper hashing
            role: 'student',
            status: 'pending',
            avatar: Utils.generateAvatar(userData.email),
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return newUser;
    }

    /**
     * Update user
     */
    function updateUser(userId, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // ==================== COURSE OPERATIONS ====================

    /**
     * Get all courses
     */
    function getCourses() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES)) || [];
    }

    /**
     * Add course
     */
    function addCourse(courseData) {
        const courses = getCourses();
        const newCourse = {
            ...courseData,
            id: 'CRS' + Date.now(),
            createdAt: new Date().toISOString()
        };
        
        courses.push(newCourse);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        return newCourse;
    }

    /**
     * Update course
     */
    function updateCourse(courseId, updates) {
        const courses = getCourses();
        const index = courses.findIndex(c => c.id === courseId);
        
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
            return courses[index];
        }
        return null;
    }

    /**
     * Delete course
     */
    function deleteCourse(courseId) {
        const courses = getCourses().filter(c => c.id !== courseId);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    }

    // ==================== PAYMENT OPERATIONS ====================

    /**
     * Get all payments
     */
    function getPayments(filters = {}) {
        let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
        
        if (filters.studentId) {
            payments = payments.filter(p => p.studentId === filters.studentId);
        }
        if (filters.status) {
            payments = payments.filter(p => p.status === filters.status);
        }
        
        return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Create payment
     */
    function createPayment(paymentData) {
        const payments = getPayments();
        const newPayment = {
            ...paymentData,
            id: 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        return newPayment;
    }

    /**
     * Update payment status
     */
    function updatePaymentStatus(paymentId, status, transactionData = {}) {
        const payments = getPayments();
        const index = payments.findIndex(p => p.id === paymentId);
        
        if (index !== -1) {
            payments[index] = {
                ...payments[index],
                status,
                ...transactionData,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
            return payments[index];
        }
        return null;
    }

    // ==================== REGISTRATION OPERATIONS ====================

    /**
     * Get all registrations
     */
    function getRegistrations(filters = {}) {
        let registrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
        
        if (filters.studentId) {
            registrations = registrations.filter(r => r.studentId === filters.studentId);
        }
        if (filters.status) {
            registrations = registrations.filter(r => r.status === filters.status);
        }
        
        return registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Create registration
     */
    function createRegistration(registrationData) {
        const registrations = getRegistrations();
        const newRegistration = {
            ...registrationData,
            id: 'REG' + Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        registrations.push(newRegistration);
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        return newRegistration;
    }

    /**
     * Update registration status
     */
    function updateRegistrationStatus(registrationId, status) {
        const registrations = getRegistrations();
        const index = registrations.findIndex(r => r.id === registrationId);
        
        if (index !== -1) {
            registrations[index].status = status;
            registrations[index].updatedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
            return registrations[index];
        }
        return null;
    }

    // ==================== SESSION MANAGEMENT ====================

    /**
     * Create session
     */
    function createSession(user) {
        const session = {
            userId: user.id,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            createdAt: new Date().toISOString()
        };
        
        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        return session;
    }

    /**
     * Get current session
     */
    function getSession() {
        const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        return session ? JSON.parse(session) : null;
    }

    /**
     * Destroy session
     */
    function destroySession() {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }

    /**
     * Check if authenticated
     */
    function isAuthenticated() {
        return getSession() !== null;
    }

    /**
     * Check user role
     */
    function hasRole(role) {
        const session = getSession();
        return session && session.role === role;
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Calculate total fees for courses
     */
    function calculateTotalFees(courseIds) {
        const courses = getCourses();
        return courseIds.reduce((total, courseId) => {
            const course = courses.find(c => c.id === courseId);
            return total + (course ? course.fee : 0);
        }, 0);
    }

    /**
     * Get dashboard statistics (for admin)
     */
    function getDashboardStats() {
        const users = getUsers();
        const payments = getPayments();
        const courses = getCourses();
        const registrations = getRegistrations();

        const completedPayments = payments.filter(p => p.status === 'completed');
        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        return {
            totalStudents: users.filter(u => u.role === 'student').length,
            pendingStudents: users.filter(u => u.role === 'student' && u.status === 'pending').length,
            totalPayments: payments.length,
            completedPayments: completedPayments.length,
            totalRevenue: totalRevenue,
            totalCourses: courses.length,
            pendingRegistrations: registrations.filter(r => r.status === 'pending').length
        };
    }

    // Initialize on load
    initializeData();

    // Public API
    return {
        // User operations
        getUsers,
        getUserById,
        getUserByEmail,
        createUser,
        updateUser,
        
        // Course operations
        getCourses,
        addCourse,
        updateCourse,
        deleteCourse,
        
        // Payment operations
        getPayments,
        createPayment,
        updatePaymentStatus,
        
        // Registration operations
        getRegistrations,
        createRegistration,
        updateRegistrationStatus,
        
        // Session management
        createSession,
        getSession,
        destroySession,
        isAuthenticated,
        hasRole,
        
        // Utilities
        calculateTotalFees,
        getDashboardStats
    };
})();

// Make data globally available
window.Data = Data;