// Storage Module for LocalStorage and SessionStorage Management

const Storage = (function() {
    // Database keys
    const STORAGE_KEYS = {
        USERS: 'uniportal_users',
        COURSES: 'uniportal_courses',
        PAYMENTS: 'uniportal_payments',
        REGISTRATIONS: 'uniportal_registrations',
        SESSION: 'uniportal_session'
    };

    // Initialize default data if empty
    function initializeData() {
        // Initialize users
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 'ADMIN001',
                    email: 'admin@uniportal.edu',
                    password: hashPassword('Admin@123'),
                    role: 'admin',
                    firstName: 'System',
                    lastName: 'Administrator',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        }

        // Initialize courses
        if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
            const defaultCourses = [
                {
                    id: generateCourseId(),
                    code: 'CS101',
                    title: 'Introduction to Computer Science',
                    credits: 3,
                    fee: 500.00,
                    department: 'Computer Science',
                    description: 'Fundamentals of programming and computer science'
                },
                {
                    id: generateCourseId(),
                    code: 'MATH201',
                    title: 'Calculus I',
                    credits: 4,
                    fee: 600.00,
                    department: 'Mathematics',
                    description: 'Differential and integral calculus'
                },
                {
                    id: generateCourseId(),
                    code: 'PHY101',
                    title: 'Physics Fundamentals',
                    credits: 3,
                    fee: 550.00,
                    department: 'Physics',
                    description: 'Introduction to classical mechanics'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
        }

        // Initialize payments
        if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
        }

        // Initialize registrations
        if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
        }
    }

    // Hash password (simple simulation - in production use proper hashing)
    function hashPassword(password) {
        return btoa(password); // Base64 encoding for simulation only
    }

    // Generate unique student ID
    function generateStudentId() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `STU${year}${random}`;
    }

    // Generate course ID
    function generateCourseId() {
        return 'CRS' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Generate payment reference
    function generatePaymentReference() {
        return 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // User operations
    function createUser(userData) {
        const users = getUsers();
        const newUser = {
            ...userData,
            id: generateStudentId(),
            password: hashPassword(userData.password),
            role: 'student',
            status: 'pending',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return newUser;
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    function getUserById(userId) {
        const users = getUsers();
        return users.find(user => user.id === userId);
    }

    function getUserByEmail(email) {
        const users = getUsers();
        return users.find(user => user.email === email);
    }

    function updateUser(userId, updates) {
        const users = getUsers();
        const index = users.findIndex(user => user.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Course operations
    function getCourses() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES)) || [];
    }

    function addCourse(courseData) {
        const courses = getCourses();
        const newCourse = {
            ...courseData,
            id: generateCourseId(),
            createdAt: new Date().toISOString()
        };
        courses.push(newCourse);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        return newCourse;
    }

    function updateCourse(courseId, updates) {
        const courses = getCourses();
        const index = courses.findIndex(course => course.id === courseId);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
            return courses[index];
        }
        return null;
    }

    function deleteCourse(courseId) {
        const courses = getCourses();
        const filtered = courses.filter(course => course.id !== courseId);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(filtered));
    }

    // Payment operations
    function createPayment(paymentData) {
        const payments = getPayments();
        const newPayment = {
            ...paymentData,
            id: generatePaymentReference(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        payments.push(newPayment);
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        return newPayment;
    }

    function getPayments(filters = {}) {
        let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
        
        if (filters.studentId) {
            payments = payments.filter(p => p.studentId === filters.studentId);
        }
        if (filters.status) {
            payments = payments.filter(p => p.status === filters.status);
        }
        
        return payments;
    }

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

    // Registration operations
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

    function getRegistrations(filters = {}) {
        let registrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
        
        if (filters.studentId) {
            registrations = registrations.filter(r => r.studentId === filters.studentId);
        }
        if (filters.status) {
            registrations = registrations.filter(r => r.status === filters.status);
        }
        
        return registrations;
    }

    function approveRegistration(registrationId) {
        const registrations = getRegistrations();
        const index = registrations.findIndex(r => r.id === registrationId);
        if (index !== -1) {
            registrations[index].status = 'approved';
            registrations[index].approvedAt = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
            return registrations[index];
        }
        return null;
    }

    // Session management
    function createSession(user) {
        const session = {
            userId: user.id,
            role: user.role,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            loginTime: new Date().toISOString(),
            sessionId: 'SESS' + Date.now()
        };
        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        return session;
    }

    function getSession() {
        const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        return session ? JSON.parse(session) : null;
    }

    function destroySession() {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }

    function isAuthenticated() {
        return getSession() !== null;
    }

    function hasRole(role) {
        const session = getSession();
        return session && session.role === role;
    }

    // Calculate total fees for selected courses
    function calculateTotalFees(courseIds) {
        const courses = getCourses();
        return courseIds.reduce((total, courseId) => {
            const course = courses.find(c => c.id === courseId);
            return total + (course ? course.fee : 0);
        }, 0);
    }

    // Export functions
    return {
        initializeData,
        createUser,
        getUsers,
        getUserById,
        getUserByEmail,
        updateUser,
        getCourses,
        addCourse,
        updateCourse,
        deleteCourse,
        createPayment,
        getPayments,
        updatePaymentStatus,
        createRegistration,
        getRegistrations,
        approveRegistration,
        createSession,
        getSession,
        destroySession,
        isAuthenticated,
        hasRole,
        calculateTotalFees,
        generatePaymentReference
    };
})();

// Initialize data on load
Storage.initializeData();