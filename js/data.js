/**
 * UniPortal - Complete Data Management Module
 * Production-ready with full CRUD operations and data validation
 */

const Data = (function() {
    // ==================== STORAGE KEYS ====================
    const STORAGE_KEYS = {
        USERS: 'uniportal_users',
        COURSES: 'uniportal_courses',
        PAYMENTS: 'uniportal_payments',
        REGISTRATIONS: 'uniportal_registrations',
        SESSION: 'uniportal_session',
        AUDIT_LOGS: 'uniportal_audit_logs',
        SETTINGS: 'uniportal_settings'
    };

    // ==================== INITIALIZATION ====================

    /**
     * Initialize database with comprehensive default data
     */
    function initializeData() {
        // Initialize users with multiple admin accounts and sample students
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 'ADMIN001',
                    email: 'admin@uniportal.edu',
                    password: btoa('Admin@123'),
                    role: 'admin',
                    firstName: 'System',
                    lastName: 'Administrator',
                    phone: '+1234567890',
                    department: 'Administration',
                    status: 'active',
                    avatar: generateAvatar('admin'),
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    permissions: ['all']
                },
                {
                    id: 'ADMIN002',
                    email: 'finance@uniportal.edu',
                    password: btoa('Finance@123'),
                    role: 'admin',
                    firstName: 'Finance',
                    lastName: 'Officer',
                    phone: '+1234567891',
                    department: 'Finance',
                    status: 'active',
                    avatar: generateAvatar('finance'),
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    permissions: ['payments', 'reports']
                },
                // Sample pending students
                {
                    id: 'STU2024001',
                    email: 'john.doe@student.edu',
                    password: btoa('Student@123'),
                    role: 'student',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567892',
                    location: 'New York, USA',
                    department: 'Computer Science',
                    program: 'B.Sc. Computer Science',
                    yearOfStudy: '2',
                    status: 'pending',
                    avatar: generateAvatar('john.doe'),
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: null
                },
                {
                    id: 'STU2024002',
                    email: 'jane.smith@student.edu',
                    password: btoa('Student@123'),
                    role: 'student',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    phone: '+1234567893',
                    location: 'Los Angeles, USA',
                    department: 'Mathematics',
                    program: 'B.Sc. Mathematics',
                    yearOfStudy: '3',
                    status: 'pending',
                    avatar: generateAvatar('jane.smith'),
                    createdAt: '2024-01-16T14:20:00Z',
                    updatedAt: null
                },
                {
                    id: 'STU2024003',
                    email: 'mike.wilson@student.edu',
                    password: btoa('Student@123'),
                    role: 'student',
                    firstName: 'Mike',
                    lastName: 'Wilson',
                    phone: '+1234567894',
                    location: 'Chicago, USA',
                    department: 'Physics',
                    program: 'B.Sc. Physics',
                    yearOfStudy: '1',
                    status: 'active',
                    avatar: generateAvatar('mike.wilson'),
                    createdAt: '2024-01-10T09:15:00Z',
                    updatedAt: null
                }
            ];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        }

        // Initialize courses with comprehensive data
        if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
            const defaultCourses = [
                {
                    id: 'CRS101',
                    code: 'CS101',
                    title: 'Introduction to Computer Science',
                    credits: 3,
                    fee: 500.00,
                    department: 'Computer Science',
                    description: 'Fundamentals of programming, algorithms, and computational thinking.',
                    instructor: 'Dr. Alan Smith',
                    schedule: 'Mon/Wed 10:00-11:30',
                    location: 'Building A, Room 101',
                    capacity: 50,
                    enrolled: 45,
                    available: true,
                    semester: 'Fall 2024',
                    level: '100',
                    prerequisites: [],
                    syllabus: 'Introduction to programming concepts, data structures, and problem-solving.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'CRS102',
                    code: 'MATH201',
                    title: 'Calculus I',
                    credits: 4,
                    fee: 600.00,
                    department: 'Mathematics',
                    description: 'Limits, derivatives, and integrals of single-variable functions.',
                    instructor: 'Prof. Emily Johnson',
                    schedule: 'Tue/Thu 13:00-14:30',
                    location: 'Building B, Room 205',
                    capacity: 40,
                    enrolled: 38,
                    available: true,
                    semester: 'Fall 2024',
                    level: '200',
                    prerequisites: ['MATH101'],
                    syllabus: 'Limits, continuity, differentiation, applications of derivatives, integration.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'CRS103',
                    code: 'PHY101',
                    title: 'Physics Fundamentals',
                    credits: 3,
                    fee: 550.00,
                    department: 'Physics',
                    description: 'Introduction to classical mechanics and thermodynamics.',
                    instructor: 'Dr. Robert Brown',
                    schedule: 'Mon/Wed/Fri 09:00-10:00',
                    location: 'Science Hall, Room 150',
                    capacity: 45,
                    enrolled: 42,
                    available: true,
                    semester: 'Fall 2024',
                    level: '100',
                    prerequisites: [],
                    syllabus: 'Kinematics, dynamics, energy, momentum, and thermodynamics.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'CRS104',
                    code: 'ENG101',
                    title: 'Technical Writing',
                    credits: 2,
                    fee: 400.00,
                    department: 'English',
                    description: 'Professional and technical communication skills.',
                    instructor: 'Prof. Sarah Davis',
                    schedule: 'Tue/Thu 10:00-11:00',
                    location: 'Building C, Room 302',
                    capacity: 35,
                    enrolled: 30,
                    available: true,
                    semester: 'Fall 2024',
                    level: '100',
                    prerequisites: [],
                    syllabus: 'Technical reports, proposals, documentation, and presentations.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'CRS105',
                    code: 'BIO101',
                    title: 'General Biology',
                    credits: 3,
                    fee: 525.00,
                    department: 'Biology',
                    description: 'Introduction to biological sciences and cellular biology.',
                    instructor: 'Dr. Michael Lee',
                    schedule: 'Mon/Wed 14:00-15:30',
                    location: 'Science Hall, Room 220',
                    capacity: 40,
                    enrolled: 36,
                    available: true,
                    semester: 'Fall 2024',
                    level: '100',
                    prerequisites: [],
                    syllabus: 'Cell structure, genetics, evolution, and ecology.',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
        }

        // Initialize payments with sample data
        if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
            const defaultPayments = [
                {
                    id: 'PAY2024001',
                    studentId: 'STU2024003',
                    amount: 1500.00,
                    description: 'Tuition Fee - Fall 2024',
                    method: 'paystack',
                    status: 'completed',
                    reference: 'PAYSTACK_REF_001',
                    transactionId: 'TXN123456',
                    paidAt: '2024-01-20T11:30:00Z',
                    createdAt: '2024-01-20T11:25:00Z',
                    updatedAt: '2024-01-20T11:30:00Z',
                    receipt: 'receipt_001.pdf'
                },
                {
                    id: 'PAY2024002',
                    studentId: 'STU2024003',
                    amount: 500.00,
                    description: 'Course Registration Fee',
                    method: 'card',
                    status: 'completed',
                    reference: 'CARD_REF_002',
                    transactionId: 'TXN123457',
                    paidAt: '2024-01-21T14:15:00Z',
                    createdAt: '2024-01-21T14:10:00Z',
                    updatedAt: '2024-01-21T14:15:00Z',
                    receipt: 'receipt_002.pdf'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(defaultPayments));
        }

        // Initialize registrations with sample data
        if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
            const defaultRegistrations = [
                {
                    id: 'REG2024001',
                    studentId: 'STU2024001',
                    courses: ['CRS101', 'CRS104'],
                    totalFees: 900.00,
                    totalCredits: 5,
                    status: 'pending',
                    session: 'Fall 2024',
                    semester: '1',
                    submittedAt: '2024-01-15T10:30:00Z',
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: null,
                    approvedBy: null,
                    approvedAt: null
                },
                {
                    id: 'REG2024002',
                    studentId: 'STU2024002',
                    courses: ['CRS102', 'CRS103'],
                    totalFees: 1150.00,
                    totalCredits: 7,
                    status: 'pending',
                    session: 'Fall 2024',
                    semester: '1',
                    submittedAt: '2024-01-16T14:20:00Z',
                    createdAt: '2024-01-16T14:20:00Z',
                    updatedAt: null,
                    approvedBy: null,
                    approvedAt: null
                },
                {
                    id: 'REG2024003',
                    studentId: 'STU2024003',
                    courses: ['CRS101', 'CRS103', 'CRS105'],
                    totalFees: 1575.00,
                    totalCredits: 9,
                    status: 'approved',
                    session: 'Fall 2024',
                    semester: '1',
                    submittedAt: '2024-01-10T09:15:00Z',
                    createdAt: '2024-01-10T09:15:00Z',
                    updatedAt: '2024-01-11T10:00:00Z',
                    approvedBy: 'ADMIN001',
                    approvedAt: '2024-01-11T10:00:00Z'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(defaultRegistrations));
        }

        // Initialize audit logs
        if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
        }

        // Initialize settings
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            const defaultSettings = {
                institutionName: 'University Portal',
                contactEmail: 'support@uniportal.edu',
                contactPhone: '+1-800-UNIVERSITY',
                address: '123 University Ave, Education City, ST 12345',
                academicYear: '2024/2025',
                currentSemester: '1',
                registrationDeadline: '2024-02-15',
                paymentDeadline: '2024-02-28',
                maxCredits: 18,
                minCredits: 12,
                currency: 'USD',
                timezone: 'America/New_York'
            };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }
    }

    // ==================== HELPER FUNCTIONS ====================

    function generateAvatar(seed) {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }

    function generateId(prefix) {
        return prefix + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    function logAudit(action, userId, details) {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || [];
        logs.push({
            id: generateId('LOG'),
            action,
            userId,
            details,
            ip: '127.0.0.1', // In production, get from request
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(-1000))); // Keep last 1000 logs
    }

    // ==================== USER OPERATIONS ====================

    function getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    }

    function getUserById(userId) {
        return getUsers().find(u => u.id === userId);
    }

    function getUserByEmail(email) {
        return getUsers().find(u => u.email === email);
    }

    function getStudents(filters = {}) {
        let students = getUsers().filter(u => u.role === 'student');
        
        if (filters.status) {
            students = students.filter(s => s.status === filters.status);
        }
        if (filters.department) {
            students = students.filter(s => s.department === filters.department);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            students = students.filter(s => 
                s.firstName.toLowerCase().includes(search) ||
                s.lastName.toLowerCase().includes(search) ||
                s.email.toLowerCase().includes(search) ||
                s.id.toLowerCase().includes(search)
            );
        }
        
        return students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function createUser(userData) {
        const users = getUsers();
        
        // Validate unique email
        if (users.some(u => u.email === userData.email)) {
            throw new Error('Email already exists');
        }

        const newUser = {
            ...userData,
            id: generateId('STU'),
            password: btoa(userData.password),
            role: 'student',
            status: 'pending',
            avatar: generateAvatar(userData.email),
            createdAt: new Date().toISOString(),
            updatedAt: null,
            lastLogin: null
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        logAudit('USER_CREATED', newUser.id, { email: newUser.email });
        return newUser;
    }

    function updateUser(userId, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            throw new Error('User not found');
        }

        // Prevent email change if already exists
        if (updates.email && updates.email !== users[index].email) {
            if (users.some(u => u.email === updates.email)) {
                throw new Error('Email already exists');
            }
        }

        users[index] = {
            ...users[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        logAudit('USER_UPDATED', userId, updates);
        return users[index];
    }

    function deleteUser(userId) {
        const users = getUsers().filter(u => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        logAudit('USER_DELETED', userId, {});
    }

    function updateUserStatus(userId, status) {
        return updateUser(userId, { status });
    }

    function updateLastLogin(userId) {
        return updateUser(userId, { lastLogin: new Date().toISOString() });
    }

    // ==================== COURSE OPERATIONS ====================

    function getCourses(filters = {}) {
        let courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES)) || [];
        
        if (filters.department) {
            courses = courses.filter(c => c.department === filters.department);
        }
        if (filters.level) {
            courses = courses.filter(c => c.level === filters.level);
        }
        if (filters.semester) {
            courses = courses.filter(c => c.semester === filters.semester);
        }
        if (filters.available !== undefined) {
            courses = courses.filter(c => c.available === filters.available);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            courses = courses.filter(c => 
                c.code.toLowerCase().includes(search) ||
                c.title.toLowerCase().includes(search) ||
                c.instructor.toLowerCase().includes(search)
            );
        }
        
        return courses.sort((a, b) => a.code.localeCompare(b.code));
    }

    function getCourseById(courseId) {
        return getCourses().find(c => c.id === courseId);
    }

    function addCourse(courseData) {
        const courses = getCourses();
        
        // Validate unique course code
        if (courses.some(c => c.code === courseData.code)) {
            throw new Error('Course code already exists');
        }

        const newCourse = {
            ...courseData,
            id: generateId('CRS'),
            enrolled: 0,
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        
        courses.push(newCourse);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        
        logAudit('COURSE_CREATED', newCourse.id, { code: newCourse.code });
        return newCourse;
    }

    function updateCourse(courseId, updates) {
        const courses = getCourses();
        const index = courses.findIndex(c => c.id === courseId);
        
        if (index === -1) {
            throw new Error('Course not found');
        }

        // Prevent code change if already exists
        if (updates.code && updates.code !== courses[index].code) {
            if (courses.some(c => c.code === updates.code)) {
                throw new Error('Course code already exists');
            }
        }

        courses[index] = {
            ...courses[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        
        logAudit('COURSE_UPDATED', courseId, updates);
        return courses[index];
    }

    function deleteCourse(courseId) {
        const courses = getCourses().filter(c => c.id !== courseId);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        
        logAudit('COURSE_DELETED', courseId, {});
    }

    function updateCourseAvailability(courseId, available) {
        return updateCourse(courseId, { available });
    }

    function incrementCourseEnrollment(courseId) {
        const course = getCourseById(courseId);
        if (course && course.enrolled < course.capacity) {
            return updateCourse(courseId, { enrolled: course.enrolled + 1 });
        }
        return null;
    }

    // ==================== PAYMENT OPERATIONS ====================

    function getPayments(filters = {}) {
        let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
        
        if (filters.studentId) {
            payments = payments.filter(p => p.studentId === filters.studentId);
        }
        if (filters.status) {
            payments = payments.filter(p => p.status === filters.status);
        }
        if (filters.method) {
            payments = payments.filter(p => p.method === filters.method);
        }
        if (filters.startDate) {
            payments = payments.filter(p => new Date(p.createdAt) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            payments = payments.filter(p => new Date(p.createdAt) <= new Date(filters.endDate));
        }
        
        return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function getPaymentById(paymentId) {
        return getPayments().find(p => p.id === paymentId);
    }

    function createPayment(paymentData) {
        const payments = getPayments();
        
        const newPayment = {
            ...paymentData,
            id: generateId('PAY'),
            reference: generateId('REF'),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        
        payments.push(newPayment);
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        
        logAudit('PAYMENT_CREATED', newPayment.id, { amount: newPayment.amount });
        return newPayment;
    }

    function updatePaymentStatus(paymentId, status, transactionData = {}) {
        const payments = getPayments();
        const index = payments.findIndex(p => p.id === paymentId);
        
        if (index === -1) {
            throw new Error('Payment not found');
        }

        payments[index] = {
            ...payments[index],
            status,
            ...transactionData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        
        logAudit('PAYMENT_UPDATED', paymentId, { status, ...transactionData });
        return payments[index];
    }

    function getStudentPaymentSummary(studentId) {
        const payments = getPayments({ studentId });
        const completed = payments.filter(p => p.status === 'completed');
        
        return {
            total: payments.length,
            completed: completed.length,
            pending: payments.filter(p => p.status === 'pending').length,
            failed: payments.filter(p => p.status === 'failed').length,
            totalAmount: completed.reduce((sum, p) => sum + p.amount, 0),
            lastPayment: completed[0] || null
        };
    }

    // ==================== REGISTRATION OPERATIONS ====================

    function getRegistrations(filters = {}) {
        let registrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
        
        if (filters.studentId) {
            registrations = registrations.filter(r => r.studentId === filters.studentId);
        }
        if (filters.status) {
            registrations = registrations.filter(r => r.status === filters.status);
        }
        if (filters.session) {
            registrations = registrations.filter(r => r.session === filters.session);
        }
        
        return registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function getRegistrationById(registrationId) {
        return getRegistrations().find(r => r.id === registrationId);
    }

    function createRegistration(registrationData) {
        const registrations = getRegistrations();
        
        // Check for existing pending registration
        const existing = registrations.find(r => 
            r.studentId === registrationData.studentId && 
            r.status === 'pending'
        );
        
        if (existing) {
            throw new Error('Student already has a pending registration');
        }

        const newRegistration = {
            ...registrationData,
            id: generateId('REG'),
            status: 'pending',
            submittedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: null,
            approvedBy: null,
            approvedAt: null
        };
        
        registrations.push(newRegistration);
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        
        logAudit('REGISTRATION_CREATED', newRegistration.id, { studentId: newRegistration.studentId });
        return newRegistration;
    }

    function approveRegistration(registrationId, adminId) {
        const registrations = getRegistrations();
        const index = registrations.findIndex(r => r.id === registrationId);
        
        if (index === -1) {
            throw new Error('Registration not found');
        }

        registrations[index] = {
            ...registrations[index],
            status: 'approved',
            updatedAt: new Date().toISOString(),
            approvedBy: adminId,
            approvedAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        
        // Update student status
        updateUserStatus(registrations[index].studentId, 'active');
        
        // Increment course enrollments
        registrations[index].courses.forEach(courseId => {
            incrementCourseEnrollment(courseId);
        });
        
        logAudit('REGISTRATION_APPROVED', registrationId, { approvedBy: adminId });
        return registrations[index];
    }

    function rejectRegistration(registrationId, reason) {
        const registrations = getRegistrations();
        const index = registrations.findIndex(r => r.id === registrationId);
        
        if (index === -1) {
            throw new Error('Registration not found');
        }

        registrations[index] = {
            ...registrations[index],
            status: 'rejected',
            rejectionReason: reason,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        
        logAudit('REGISTRATION_REJECTED', registrationId, { reason });
        return registrations[index];
    }

    // ==================== SESSION MANAGEMENT ====================

    function createSession(user) {
        const session = {
            userId: user.id,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            permissions: user.permissions || [],
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        
        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        
        // Update last login
        updateLastLogin(user.id);
        
        logAudit('SESSION_CREATED', user.id, {});
        return session;
    }

    function getSession() {
        const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!session) return null;
        
        const sessionData = JSON.parse(session);
        
        // Check expiration
        if (new Date(sessionData.expiresAt) < new Date()) {
            destroySession();
            return null;
        }
        
        return sessionData;
    }

    function destroySession() {
        const session = getSession();
        if (session) {
            logAudit('SESSION_DESTROYED', session.userId, {});
        }
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }

    function isAuthenticated() {
        return getSession() !== null;
    }

    function hasRole(role) {
        const session = getSession();
        return session && session.role === role;
    }

    function hasPermission(permission) {
        const session = getSession();
        return session && (session.permissions.includes('all') || session.permissions.includes(permission));
    }

    // ==================== DASHBOARD STATISTICS ====================

    function getDashboardStats() {
        const users = getUsers();
        const payments = getPayments();
        const courses = getCourses();
        const registrations = getRegistrations();

        const students = users.filter(u => u.role === 'student');
        const completedPayments = payments.filter(p => p.status === 'completed');
        const pendingPayments = payments.filter(p => p.status === 'pending');
        
        // Current date calculations
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        // Monthly stats
        const thisMonthPayments = completedPayments.filter(p => {
            const date = new Date(p.createdAt);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });
        
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        
        const lastMonthPayments = completedPayments.filter(p => {
            const date = new Date(p.createdAt);
            return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
        });

        // Department distribution
        const departmentStats = {};
        students.forEach(s => {
            const dept = s.department || 'Undeclared';
            departmentStats[dept] = (departmentStats[dept] || 0) + 1;
        });

        // Course popularity
        const courseStats = {};
        registrations.forEach(r => {
            r.courses.forEach(courseId => {
                courseStats[courseId] = (courseStats[courseId] || 0) + 1;
            });
        });

        const popularCourses = Object.entries(courseStats)
            .map(([id, count]) => ({ id, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            // Student stats
            totalStudents: students.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            pendingStudents: students.filter(s => s.status === 'pending').length,
            suspendedStudents: students.filter(s => s.status === 'suspended').length,
            
            // Payment stats
            totalPayments: payments.length,
            completedPayments: completedPayments.length,
            pendingPayments: pendingPayments.length,
            failedPayments: payments.filter(p => p.status === 'failed').length,
            
            // Revenue stats
            totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
            monthlyRevenue: thisMonthPayments.reduce((sum, p) => sum + p.amount, 0),
            previousMonthRevenue: lastMonthPayments.reduce((sum, p) => sum + p.amount, 0),
            
            // Growth calculations
            revenueGrowth: calculateGrowth(
                lastMonthPayments.reduce((sum, p) => sum + p.amount, 0),
                thisMonthPayments.reduce((sum, p) => sum + p.amount, 0)
            ),
            studentGrowth: calculateGrowth(
                students.filter(s => {
                    const date = new Date(s.createdAt);
                    return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
                }).length,
                students.filter(s => {
                    const date = new Date(s.createdAt);
                    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
                }).length
            ),
            
            // Course stats
            totalCourses: courses.length,
            availableCourses: courses.filter(c => c.available).length,
            fullCourses: courses.filter(c => c.enrolled >= c.capacity).length,
            totalCapacity: courses.reduce((sum, c) => sum + c.capacity, 0),
            totalEnrolled: courses.reduce((sum, c) => sum + c.enrolled, 0),
            
            // Registration stats
            totalRegistrations: registrations.length,
            pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
            approvedRegistrations: registrations.filter(r => r.status === 'approved').length,
            rejectedRegistrations: registrations.filter(r => r.status === 'rejected').length,
            
            // Analytics
            departmentDistribution: departmentStats,
            popularCourses,
            
            // Financial summary
            averagePayment: completedPayments.length > 0 
                ? completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length 
                : 0,
            largestPayment: completedPayments.length > 0 
                ? Math.max(...completedPayments.map(p => p.amount)) 
                : 0,
            
            // Timestamps
            lastUpdated: new Date().toISOString()
        };
    }

    function calculateGrowth(previous, current) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    }

    // ==================== REPORTING ====================

    function getFinancialReport(startDate, endDate) {
        const payments = getPayments({
            startDate,
            endDate,
            status: 'completed'
        });

        const byMethod = {};
        const byDay = {};

        payments.forEach(p => {
            // Group by method
            byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;

            // Group by day
            const day = new Date(p.createdAt).toISOString().split('T')[0];
            byDay[day] = (byDay[day] || 0) + p.amount;
        });

        return {
            period: { startDate, endDate },
            totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
            transactionCount: payments.length,
            averageTransaction: payments.length > 0 
                ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
                : 0,
            byMethod,
            byDay,
            payments: payments.slice(0, 100) // Last 100 payments
        };
    }

    function getEnrollmentReport(session) {
        const registrations = getRegistrations({ session, status: 'approved' });
        const courses = getCourses();

        const byDepartment = {};
        const byCourse = {};

        registrations.forEach(reg => {
            reg.courses.forEach(courseId => {
                const course = courses.find(c => c.id === courseId);
                if (course) {
                    byDepartment[course.department] = (byDepartment[course.department] || 0) + 1;
                    byCourse[course.code] = (byCourse[course.code] || 0) + 1;
                }
            });
        });

        return {
            session,
            totalEnrollments: registrations.length,
            totalCourses: Object.keys(byCourse).length,
            byDepartment,
            byCourse,
            registrations: registrations.slice(0, 100)
        };
    }

    // ==================== SETTINGS ====================

    function getSettings() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    }

    function updateSettings(updates) {
        const settings = getSettings();
        const newSettings = { ...settings, ...updates };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
        
        logAudit('SETTINGS_UPDATED', 'system', updates);
        return newSettings;
    }

    // ==================== AUDIT LOGS ====================

    function getAuditLogs(filters = {}) {
        let logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || [];
        
        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action === filters.action);
        }
        if (filters.startDate) {
            logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
        }
        
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // ==================== EXPORT FUNCTIONS ====================

    function exportData(type, filters = {}) {
        let data = [];
        
        switch(type) {
            case 'students':
                data = getStudents(filters);
                break;
            case 'courses':
                data = getCourses(filters);
                break;
            case 'payments':
                data = getPayments(filters);
                break;
            case 'registrations':
                data = getRegistrations(filters);
                break;
        }
        
        return data.map(item => {
            if (type === 'students') {
                return {
                    'ID': item.id,
                    'First Name': item.firstName,
                    'Last Name': item.lastName,
                    'Email': item.email,
                    'Phone': item.phone || '',
                    'Department': item.department || '',
                    'Status': item.status,
                    'Joined': item.createdAt
                };
            }
            // Add other export formats as needed
            return item;
        });
    }

    // Initialize on load
    initializeData();

    // Public API
    return {
        // User operations
        getUsers,
        getUserById,
        getUserByEmail,
        getStudents,
        createUser,
        updateUser,
        deleteUser,
        updateUserStatus,
        
        // Course operations
        getCourses,
        getCourseById,
        addCourse,
        updateCourse,
        deleteCourse,
        updateCourseAvailability,
        
        // Payment operations
        getPayments,
        getPaymentById,
        createPayment,
        updatePaymentStatus,
        getStudentPaymentSummary,
        
        // Registration operations
        getRegistrations,
        getRegistrationById,
        createRegistration,
        approveRegistration,
        rejectRegistration,
        
        // Session management
        createSession,
        getSession,
        destroySession,
        isAuthenticated,
        hasRole,
        hasPermission,
        
        // Dashboard and reports
        getDashboardStats,
        getFinancialReport,
        getEnrollmentReport,
        
        // Settings
        getSettings,
        updateSettings,
        
        // Audit
        getAuditLogs,
        
        // Export
        exportData,
        
        // Utilities
        generateId
    };
})();

// Make data globally available
window.Data = Data;