/**
 * UniPortal - Complete Data Management Module
 * Handles ALL localStorage operations with full CRUD functionality
 */

const Data = (function() {
    // ==================== STORAGE KEYS ====================
    const STORAGE_KEYS = {
        USERS: 'uniportal_users',
        COURSES: 'uniportal_courses',
        PAYMENTS: 'uniportal_payments',
        REGISTRATIONS: 'uniportal_registrations',
        SESSIONS: 'uniportal_sessions',
        AUDIT_LOGS: 'uniportal_audit_logs',
        NOTIFICATIONS: 'uniportal_notifications',
        SETTINGS: 'uniportal_settings'
    };

    // ==================== INITIALIZATION WITH DEFAULT DATA ====================

    function initializeData() {
        // Initialize Users with proper structure
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            const defaultUsers = [
                {
                    id: 'ADMIN001',
                    email: 'admin@uniportal.edu',
                    password: btoa('Admin@123'), // Demo only - use proper hashing
                    role: 'admin',
                    firstName: 'System',
                    lastName: 'Administrator',
                    phone: '+1234567890',
                    department: 'Administration',
                    status: 'active',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    permissions: ['all']
                },
                {
                    id: 'STU2024001',
                    email: 'john.doe@student.edu',
                    password: btoa('Student@123'),
                    role: 'student',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567891',
                    department: 'Computer Science',
                    program: 'B.Sc Computer Science',
                    yearOfStudy: '2',
                    semester: '1',
                    address: '123 Campus Road',
                    city: 'New York',
                    country: 'USA',
                    status: 'active',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=john`,
                    createdAt: '2024-01-15T10:30:00Z',
                    lastLogin: null
                },
                {
                    id: 'STU2024002',
                    email: 'jane.smith@student.edu',
                    password: btoa('Student@123'),
                    role: 'student',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    phone: '+1234567892',
                    department: 'Mathematics',
                    program: 'B.Sc Mathematics',
                    yearOfStudy: '3',
                    semester: '1',
                    address: '456 College Ave',
                    city: 'Boston',
                    country: 'USA',
                    status: 'pending',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=jane`,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                }
            ];
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        }

        // Initialize Courses with complete structure
        if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
            const defaultCourses = [
                {
                    id: 'CRS101',
                    code: 'CS101',
                    title: 'Introduction to Computer Science',
                    credits: 3,
                    fee: 500,
                    department: 'Computer Science',
                    level: '100',
                    semester: '1',
                    instructor: 'Dr. Smith',
                    schedule: 'Mon/Wed 10:00-11:30',
                    room: 'Room 201',
                    capacity: 50,
                    enrolled: 45,
                    available: true,
                    description: 'Fundamentals of programming, algorithms, and computer systems',
                    prerequisites: [],
                    syllabus: 'Week1-15: Programming basics, Data structures, Algorithms',
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'CRS102',
                    code: 'MATH201',
                    title: 'Calculus I',
                    credits: 4,
                    fee: 600,
                    department: 'Mathematics',
                    level: '200',
                    semester: '1',
                    instructor: 'Prof. Johnson',
                    schedule: 'Tue/Thu 13:00-14:30',
                    room: 'Room 305',
                    capacity: 40,
                    enrolled: 38,
                    available: true,
                    description: 'Limits, derivatives, integrals, and applications',
                    prerequisites: ['MATH101'],
                    syllabus: 'Week1-15: Limits, Derivatives, Integration',
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'CRS103',
                    code: 'PHY101',
                    title: 'Physics Fundamentals',
                    credits: 3,
                    fee: 550,
                    department: 'Physics',
                    level: '100',
                    semester: '1',
                    instructor: 'Dr. Williams',
                    schedule: 'Mon/Wed/Fri 09:00-10:00',
                    room: 'Lab 101',
                    capacity: 45,
                    enrolled: 42,
                    available: true,
                    description: 'Mechanics, thermodynamics, and waves',
                    prerequisites: [],
                    syllabus: 'Week1-15: Mechanics, Heat, Waves',
                    createdAt: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'CRS104',
                    code: 'ENG201',
                    title: 'Technical Writing',
                    credits: 2,
                    fee: 400,
                    department: 'English',
                    level: '200',
                    semester: '2',
                    instructor: 'Prof. Brown',
                    schedule: 'Tue/Thu 10:00-11:00',
                    room: 'Room 402',
                    capacity: 35,
                    enrolled: 30,
                    available: true,
                    description: 'Professional and technical communication',
                    prerequisites: ['ENG101'],
                    syllabus: 'Week1-15: Reports, Proposals, Documentation',
                    createdAt: '2024-01-01T00:00:00Z'
                }
            ];
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(defaultCourses));
        }

        // Initialize Payments
        if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
            const defaultPayments = [
                {
                    id: 'PAY2024001',
                    studentId: 'STU2024001',
                    amount: 1500,
                    description: 'Tuition Fee - Semester 1',
                    method: 'Paystack',
                    status: 'completed',
                    reference: 'REF' + Date.now() + '001',
                    transactionId: 'TXN123456',
                    paidAt: '2024-01-20T14:30:00Z',
                    createdAt: '2024-01-20T14:30:00Z'
                },
                {
                    id: 'PAY2024002',
                    studentId: 'STU2024002',
                    amount: 600,
                    description: 'Course Registration - MATH201',
                    method: 'Flutterwave',
                    status: 'pending',
                    reference: 'REF' + Date.now() + '002',
                    transactionId: null,
                    paidAt: null,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(defaultPayments));
        }

        // Initialize Registrations
        if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
            const defaultRegistrations = [
                {
                    id: 'REG2024001',
                    studentId: 'STU2024001',
                    courses: ['CRS101', 'CRS102'],
                    totalFees: 1100,
                    totalCredits: 7,
                    session: '2024/2025',
                    semester: '1',
                    status: 'approved',
                    approvedBy: 'ADMIN001',
                    approvedAt: '2024-01-16T09:00:00Z',
                    createdAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: 'REG2024002',
                    studentId: 'STU2024002',
                    courses: ['CRS102', 'CRS103'],
                    totalFees: 1150,
                    totalCredits: 7,
                    session: '2024/2025',
                    semester: '1',
                    status: 'pending',
                    approvedBy: null,
                    approvedAt: null,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(defaultRegistrations));
        }

        // Initialize Audit Logs
        if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
        }

        // Initialize Notifications
        if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
        }

        // Initialize Settings
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            const defaultSettings = {
                institutionName: 'University Portal',
                currency: 'USD',
                academicYear: '2024/2025',
                currentSemester: '1',
                registrationDeadline: new Date(Date.now() + 30*86400000).toISOString(),
                paymentDeadline: new Date(Date.now() + 45*86400000).toISOString(),
                maxCredits: 18,
                minCredits: 12,
                lateRegistrationFee: 50,
                emailNotifications: true,
                smsNotifications: false
            };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }
    }

    // ==================== AUDIT LOGGING ====================

    function addAuditLog(action, userId, details) {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || [];
        const log = {
            id: 'LOG' + Date.now() + Math.random().toString(36).substr(2, 9),
            action,
            userId,
            details,
            ip: '127.0.0.1', // In production, get real IP
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        logs.push(log);
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
        return log;
    }

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

    // ==================== NOTIFICATION SYSTEM ====================

    function createNotification(userId, type, message, data = {}) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
        const notification = {
            id: 'NOTIF' + Date.now() + Math.random().toString(36).substr(2, 9),
            userId,
            type,
            message,
            data,
            read: false,
            createdAt: new Date().toISOString()
        };
        notifications.push(notification);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        return notification;
    }

    function getNotifications(userId, unreadOnly = false) {
        let notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
        notifications = notifications.filter(n => n.userId === userId);
        
        if (unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }
        
        return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function markNotificationAsRead(notificationId) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
        const index = notifications.findIndex(n => n.id === notificationId);
        
        if (index !== -1) {
            notifications[index].read = true;
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
            return notifications[index];
        }
        return null;
    }

    function markAllNotificationsAsRead(userId) {
        const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
        const updated = notifications.map(n => {
            if (n.userId === userId) {
                n.read = true;
            }
            return n;
        });
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
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

    function createUser(userData) {
        const users = getUsers();
        const newUser = {
            ...userData,
            id: 'STU' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase(),
            password: btoa(userData.password),
            role: 'student',
            status: 'active', // Changed from 'pending' to 'active'
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Optional: Create notification but skip admin approval
        const admins = users.filter(u => u.role === 'admin');
        admins.forEach(admin => {
            createNotification(
                admin.id,
                'new_student',
                `New student registered: ${newUser.firstName} ${newUser.lastName}`,
                { studentId: newUser.id }
            );
        });
        
        addAuditLog('user_created', newUser.id, { email: newUser.email });
        return newUser;
    }

    function updateUser(userId, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index !== -1) {
            const oldData = { ...users[index] };
            users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            
            addAuditLog('user_updated', userId, { 
                old: oldData,
                new: updates 
            });
            
            return users[index];
        }
        return null;
    }

    function deleteUser(userId) {
        const users = getUsers().filter(u => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        addAuditLog('user_deleted', userId, {});
    }

    function approveStudent(studentId) {
        const result = updateUser(studentId, { 
            status: 'active',
            approvedAt: new Date().toISOString() 
        });
        
        if (result) {
            // Create notification for student
            createNotification(
                studentId,
                'account_approved',
                'Your account has been approved! You can now register for courses.',
                {}
            );
            
            addAuditLog('student_approved', studentId, { approvedBy: 'admin' });
        }
        
        return result;
    }

    function rejectStudent(studentId, reason) {
        const result = updateUser(studentId, { 
            status: 'rejected',
            rejectionReason: reason,
            rejectedAt: new Date().toISOString()
        });
        
        if (result) {
            createNotification(
                studentId,
                'account_rejected',
                `Your account application was rejected. Reason: ${reason}`,
                { reason }
            );
            
            addAuditLog('student_rejected', studentId, { reason });
        }
        
        return result;
    }

    function suspendStudent(studentId, reason) {
        const result = updateUser(studentId, { 
            status: 'suspended',
            suspensionReason: reason,
            suspendedAt: new Date().toISOString()
        });
        
        if (result) {
            createNotification(
                studentId,
                'account_suspended',
                `Your account has been suspended. Reason: ${reason}`,
                { reason }
            );
            
            addAuditLog('student_suspended', studentId, { reason });
        }
        
        return result;
    }

    function activateStudent(studentId) {
        const result = updateUser(studentId, { 
            status: 'active',
            activatedAt: new Date().toISOString(),
            suspensionReason: null,
            suspendedAt: null
        });
        
        if (result) {
            createNotification(
                studentId,
                'account_activated',
                'Your account has been reactivated.',
                {}
            );
            
            addAuditLog('student_activated', studentId, {});
        }
        
        return result;
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
        
        return courses;
    }

    function getCourseById(courseId) {
        return getCourses().find(c => c.id === courseId);
    }

    function getCourseByCode(code) {
        return getCourses().find(c => c.code === code);
    }

    function addCourse(courseData) {
        const courses = getCourses();
        
        // Check if course code already exists
        if (courses.some(c => c.code === courseData.code)) {
            throw new Error('Course code already exists');
        }
        
        const newCourse = {
            ...courseData,
            id: 'CRS' + Date.now(),
            enrolled: 0,
            available: true,
            createdAt: new Date().toISOString()
        };
        
        courses.push(newCourse);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        
        addAuditLog('course_created', 'system', { 
            code: newCourse.code,
            title: newCourse.title 
        });
        
        return newCourse;
    }

    function updateCourse(courseId, updates) {
        const courses = getCourses();
        const index = courses.findIndex(c => c.id === courseId);
        
        if (index !== -1) {
            const oldData = { ...courses[index] };
            courses[index] = { ...courses[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
            
            addAuditLog('course_updated', 'system', { 
                courseId,
                old: oldData,
                new: updates 
            });
            
            return courses[index];
        }
        return null;
    }

    function deleteCourse(courseId) {
        // Check if course is being used in any registration
        const registrations = getRegistrations();
        const inUse = registrations.some(r => r.courses.includes(courseId) && r.status === 'approved');
        
        if (inUse) {
            throw new Error('Cannot delete course that is currently registered by students');
        }
        
        const courses = getCourses().filter(c => c.id !== courseId);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        
        addAuditLog('course_deleted', 'system', { courseId });
    }

    function toggleCourseAvailability(courseId) {
        const course = getCourseById(courseId);
        if (!course) return null;
        
        return updateCourse(courseId, { available: !course.available });
    }

    function incrementCourseEnrollment(courseId) {
        const course = getCourseById(courseId);
        if (!course) return null;
        
        const newEnrolled = course.enrolled + 1;
        const available = newEnrolled < course.capacity;
        
        return updateCourse(courseId, { 
            enrolled: newEnrolled,
            available 
        });
    }

    function decrementCourseEnrollment(courseId) {
        const course = getCourseById(courseId);
        if (!course) return null;
        
        const newEnrolled = Math.max(0, course.enrolled - 1);
        
        return updateCourse(courseId, { 
            enrolled: newEnrolled,
            available: true 
        });
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
            id: 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase(),
            reference: 'REF' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
            status: paymentData.status || 'pending',
            createdAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        
        // Create notification for student
        createNotification(
            paymentData.studentId,
            'payment_created',
            `Payment of ${formatCurrency(paymentData.amount)} initiated.`,
            { paymentId: newPayment.id }
        );
        
        addAuditLog('payment_created', paymentData.studentId, { 
            amount: paymentData.amount,
            paymentId: newPayment.id 
        });
        
        return newPayment;
    }

    function updatePaymentStatus(paymentId, status, transactionData = {}) {
        const payments = getPayments();
        const index = payments.findIndex(p => p.id === paymentId);
        
        if (index !== -1) {
            payments[index] = {
                ...payments[index],
                status,
                ...transactionData,
                updatedAt: new Date().toISOString(),
                paidAt: status === 'completed' ? new Date().toISOString() : payments[index].paidAt
            };
            
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
            
            // Create notification for student
            createNotification(
                payments[index].studentId,
                `payment_${status}`,
                `Payment ${status}: ${formatCurrency(payments[index].amount)}`,
                { paymentId }
            );
            
            addAuditLog('payment_updated', payments[index].studentId, { 
                paymentId,
                status,
                transactionData 
            });
            
            return payments[index];
        }
        return null;
    }

    function getPaymentStats() {
        const payments = getPayments();
        const completed = payments.filter(p => p.status === 'completed');
        
        const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
        const monthlyRevenue = {};
        const methodStats = {};
        
        completed.forEach(p => {
            const month = new Date(p.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
            
            const method = p.method || 'Other';
            methodStats[method] = (methodStats[method] || 0) + 1;
        });
        
        return {
            total: payments.length,
            completed: completed.length,
            pending: payments.filter(p => p.status === 'pending').length,
            failed: payments.filter(p => p.status === 'failed').length,
            totalRevenue,
            averageAmount: completed.length > 0 ? totalRevenue / completed.length : 0,
            monthlyRevenue,
            methodStats,
            successRate: payments.length > 0 ? (completed.length / payments.length * 100).toFixed(1) : 0
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
        if (filters.semester) {
            registrations = registrations.filter(r => r.semester === filters.semester);
        }
        
        return registrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    function getRegistrationById(registrationId) {
        const registrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
        return registrations.find(r => r.id === registrationId);
    }

    function createRegistration(registrationData) {
        const registrations = getRegistrations();
        
        // Check for existing pending registration
        const existing = registrations.find(r => 
            r.studentId === registrationData.studentId && 
            r.status === 'pending'
        );
        
        if (existing) {
            throw new Error('You already have a pending registration');
        }
        
        // Calculate total credits
        const courses = getCourses();
        const totalCredits = registrationData.courses.reduce((sum, courseId) => {
            const course = courses.find(c => c.id === courseId);
            return sum + (course ? course.credits : 0);
        }, 0);
        
        const newRegistration = {
            ...registrationData,
            id: 'REG' + Date.now(),
            totalCredits,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        registrations.push(newRegistration);
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        
        // Create notification for admins
        const users = getUsers();
        const admins = users.filter(u => u.role === 'admin');
        admins.forEach(admin => {
            createNotification(
                admin.id,
                'new_registration',
                `New registration pending approval from student ${registrationData.studentId}`,
                { registrationId: newRegistration.id }
            );
        });
        
        addAuditLog('registration_created', registrationData.studentId, { 
            registrationId: newRegistration.id,
            courses: registrationData.courses 
        });
        
        return newRegistration;
    }

    function approveRegistration(registrationId, adminId) {
        const registrations = getRegistrations();
        const index = registrations.findIndex(r => r.id === registrationId);
        
        if (index !== -1) {
            registrations[index].status = 'approved';
            registrations[index].approvedBy = adminId;
            registrations[index].approvedAt = new Date().toISOString();
            
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
            
            // Increment course enrollments
            registrations[index].courses.forEach(courseId => {
                incrementCourseEnrollment(courseId);
            });
            
            // Create notification for student
            createNotification(
                registrations[index].studentId,
                'registration_approved',
                'Your course registration has been approved!',
                { registrationId }
            );
            
            // Create payment record
            createPayment({
                studentId: registrations[index].studentId,
                amount: registrations[index].totalFees,
                description: 'Course Registration Fees',
                method: 'Pending'
            });
            
            addAuditLog('registration_approved', adminId, { 
                registrationId,
                studentId: registrations[index].studentId 
            });
            
            return registrations[index];
        }
        return null;
    }

    function rejectRegistration(registrationId, adminId, reason) {
        const registrations = getRegistrations();
        const index = registrations.findIndex(r => r.id === registrationId);
        
        if (index !== -1) {
            registrations[index].status = 'rejected';
            registrations[index].approvedBy = adminId;
            registrations[index].rejectedAt = new Date().toISOString();
            registrations[index].rejectionReason = reason;
            
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
            
            // Create notification for student
            createNotification(
                registrations[index].studentId,
                'registration_rejected',
                `Your course registration was rejected. Reason: ${reason}`,
                { registrationId, reason }
            );
            
            addAuditLog('registration_rejected', adminId, { 
                registrationId,
                studentId: registrations[index].studentId,
                reason 
            });
            
            return registrations[index];
        }
        return null;
    }

    function getRegistrationStats() {
        const registrations = getRegistrations();
        
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'pending').length,
            approved: registrations.filter(r => r.status === 'approved').length,
            rejected: registrations.filter(r => r.status === 'rejected').length,
            byDepartment: calculateRegistrationsByDepartment(registrations)
        };
    }

    function calculateRegistrationsByDepartment(registrations) {
        const courses = getCourses();
        const stats = {};
        
        registrations.forEach(reg => {
            reg.courses.forEach(courseId => {
                const course = courses.find(c => c.id === courseId);
                if (course) {
                    stats[course.department] = (stats[course.department] || 0) + 1;
                }
            });
        });
        
        return stats;
    }

    // ==================== DASHBOARD STATISTICS ====================

    function getDashboardStats() {
        const users = getUsers();
        const payments = getPayments();
        const courses = getCourses();
        const registrations = getRegistrations();
        const settings = getSettings();

        const students = users.filter(u => u.role === 'student');
        const completedPayments = payments.filter(p => p.status === 'completed');
        const pendingRegistrations = registrations.filter(r => r.status === 'pending');
        const pendingStudents = students.filter(s => s.status === 'pending');

        // Calculate revenue
        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // This month's revenue
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        const thisMonthRevenue = completedPayments.filter(p => {
            const date = new Date(p.paidAt || p.createdAt);
            return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).reduce((sum, p) => sum + p.amount, 0);

        // Last month's revenue
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        
        const lastMonthRevenue = completedPayments.filter(p => {
            const date = new Date(p.paidAt || p.createdAt);
            return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
        }).reduce((sum, p) => sum + p.amount, 0);

        // Growth percentage
        const revenueGrowth = lastMonthRevenue > 0 
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : thisMonthRevenue > 0 ? 100 : 0;

        // Enrollment stats
        const totalEnrollments = registrations.filter(r => r.status === 'approved').length;
        const activeCourses = courses.filter(c => c.available).length;

        return {
            // Student stats
            totalStudents: students.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            pendingStudents: pendingStudents.length,
            suspendedStudents: students.filter(s => s.status === 'suspended').length,
            
            // Course stats
            totalCourses: courses.length,
            activeCourses,
            totalCredits: courses.reduce((sum, c) => sum + c.credits, 0),
            
            // Payment stats
            totalPayments: payments.length,
            completedPayments: completedPayments.length,
            pendingPayments: payments.filter(p => p.status === 'pending').length,
            failedPayments: payments.filter(p => p.status === 'failed').length,
            
            // Revenue stats
            totalRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
            revenueGrowth,
            averagePayment: completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0,
            
            // Registration stats
            totalRegistrations: registrations.length,
            pendingRegistrations: pendingRegistrations.length,
            approvedRegistrations: registrations.filter(r => r.status === 'approved').length,
            totalEnrollments,
            
            // System stats
            registrationDeadline: settings.registrationDeadline,
            paymentDeadline: settings.paymentDeadline,
            maxCredits: settings.maxCredits
        };
    }

    // ==================== SETTINGS MANAGEMENT ====================

    function getSettings() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    }

    function updateSettings(settings) {
        const current = getSettings();
        const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        
        addAuditLog('settings_updated', 'system', { settings });
        
        return updated;
    }

    // ==================== SESSION MANAGEMENT ====================

    function createSession(user) {
        const session = {
            userId: user.id,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.avatar,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString() // 24 hours
        };
        
        sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        
        // Update last login
        updateUser(user.id, { lastLogin: new Date().toISOString() });
        
        return session;
    }

    function getSession() {
        const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!session) return null;
        
        const parsed = JSON.parse(session);
        
        // Check if session expired
        if (new Date(parsed.expiresAt) < new Date()) {
            destroySession();
            return null;
        }
        
        return parsed;
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

    // ==================== UTILITY FUNCTIONS ====================

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Initialize on load
    initializeData();

    // Public API - Complete export of all functions
    return {
        // User operations
        getUsers,
        getUserById,
        getUserByEmail,
        createUser,
        updateUser,
        deleteUser,
        approveStudent,
        rejectStudent,
        suspendStudent,
        activateStudent,
        
        // Course operations
        getCourses,
        getCourseById,
        getCourseByCode,
        addCourse,
        updateCourse,
        deleteCourse,
        toggleCourseAvailability,
        incrementCourseEnrollment,
        decrementCourseEnrollment,
        
        // Payment operations
        getPayments,
        getPaymentById,
        createPayment,
        updatePaymentStatus,
        getPaymentStats,
        
        // Registration operations
        getRegistrations,
        getRegistrationById,
        createRegistration,
        approveRegistration,
        rejectRegistration,
        getRegistrationStats,
        
        // Notification operations
        createNotification,
        getNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        
        // Audit operations
        addAuditLog,
        getAuditLogs,
        
        // Settings operations
        getSettings,
        updateSettings,
        
        // Session management
        createSession,
        getSession,
        destroySession,
        isAuthenticated,
        hasRole,
        
        // Dashboard statistics
        getDashboardStats,
        
        // Utility
        formatCurrency
    };
})();

// Make Data globally available
window.Data = Data;