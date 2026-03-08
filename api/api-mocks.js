// API Mocks - Simulated API Responses for Development

const APIMocks = (function() {
    // Mock email validation responses
    const emailValidationMocks = {
        'student@university.edu': {
            valid: true,
            format: 'valid',
            domain: 'university.edu',
            disposable: false,
            score: 0.95
        },
        'test@gmail.com': {
            valid: true,
            format: 'valid',
            domain: 'gmail.com',
            disposable: false,
            score: 0.85
        },
        'invalid@tempmail.com': {
            valid: false,
            format: 'valid',
            domain: 'tempmail.com',
            disposable: true,
            score: 0.20
        }
    };

    // Mock payment responses
    const paymentMocks = {
        success: {
            status: 'success',
            message: 'Payment successful',
            data: {
                reference: 'PAY-' + Date.now(),
                amount: 50000,
                currency: 'USD',
                paid_at: new Date().toISOString()
            }
        },
        failed: {
            status: 'failed',
            message: 'Payment failed',
            data: null
        },
        pending: {
            status: 'pending',
            message: 'Payment pending',
            data: null
        }
    };

    // Mock course data
    const courseMocks = [
        {
            id: 'CRS001',
            code: 'CS101',
            title: 'Introduction to Computer Science',
            credits: 3,
            fee: 500,
            department: 'Computer Science',
            description: 'Fundamentals of programming and computer science concepts',
            instructor: 'Dr. Smith',
            schedule: 'Mon/Wed 10:00-11:30',
            capacity: 50,
            enrolled: 45,
            level: '100',
            semester: '1',
            prerequisites: 'None'
        },
        {
            id: 'CRS002',
            code: 'MATH201',
            title: 'Calculus I',
            credits: 4,
            fee: 600,
            department: 'Mathematics',
            description: 'Differential and integral calculus',
            instructor: 'Prof. Johnson',
            schedule: 'Tue/Thu 13:00-14:30',
            capacity: 40,
            enrolled: 38,
            level: '200',
            semester: '1',
            prerequisites: 'MATH101'
        },
        {
            id: 'CRS003',
            code: 'PHY101',
            title: 'Physics Fundamentals',
            credits: 3,
            fee: 550,
            department: 'Physics',
            description: 'Introduction to classical mechanics',
            instructor: 'Dr. Williams',
            schedule: 'Mon/Wed/Fri 09:00-10:00',
            capacity: 45,
            enrolled: 42,
            level: '100',
            semester: '1',
            prerequisites: 'None'
        },
        {
            id: 'CRS004',
            code: 'ENG201',
            title: 'Technical Writing',
            credits: 2,
            fee: 400,
            department: 'English',
            description: 'Professional and technical communication',
            instructor: 'Prof. Brown',
            schedule: 'Tue/Thu 10:00-11:00',
            capacity: 35,
            enrolled: 30,
            level: '200',
            semester: '2',
            prerequisites: 'ENG101'
        },
        {
            id: 'CRS005',
            code: 'BIO101',
            title: 'General Biology',
            credits: 3,
            fee: 525,
            department: 'Biology',
            description: 'Introduction to biological sciences',
            instructor: 'Dr. Jones',
            schedule: 'Mon/Wed 14:00-15:30',
            capacity: 40,
            enrolled: 36,
            level: '100',
            semester: '1',
            prerequisites: 'None'
        },
        {
            id: 'CRS006',
            code: 'CHEM201',
            title: 'Organic Chemistry',
            credits: 4,
            fee: 650,
            department: 'Chemistry',
            description: 'Structure and reactions of organic compounds',
            instructor: 'Dr. Davis',
            schedule: 'Tue/Thu 09:00-10:30',
            capacity: 30,
            enrolled: 28,
            level: '200',
            semester: '2',
            prerequisites: 'CHEM101'
        }
    ];

    // Mock student data
    const studentMocks = [
        {
            id: 'STU2024001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@university.edu',
            phone: '+1234567890',
            department: 'Computer Science',
            program: 'B.Sc. Computer Science',
            yearOfStudy: '2',
            gpa: 3.5,
            status: 'active'
        },
        {
            id: 'STU2024002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@university.edu',
            phone: '+1234567891',
            department: 'Mathematics',
            program: 'B.Sc. Mathematics',
            yearOfStudy: '3',
            gpa: 3.8,
            status: 'active'
        },
        {
            id: 'STU2024003',
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael.j@university.edu',
            phone: '+1234567892',
            department: 'Physics',
            program: 'B.Sc. Physics',
            yearOfStudy: '1',
            gpa: 3.2,
            status: 'pending'
        }
    ];

    // Mock payment history
    const paymentHistoryMocks = [
        {
            id: 'PAY2024001',
            studentId: 'STU2024001',
            amount: 1500,
            description: 'Tuition Fee - Semester 1',
            method: 'Paystack',
            status: 'completed',
            createdAt: '2024-01-15T10:30:00Z',
            transactionId: 'TXN123456'
        },
        {
            id: 'PAY2024002',
            studentId: 'STU2024002',
            amount: 1650,
            description: 'Tuition Fee - Semester 1',
            method: 'Flutterwave',
            status: 'completed',
            createdAt: '2024-01-16T14:20:00Z',
            transactionId: 'TXN123457'
        },
        {
            id: 'PAY2024003',
            studentId: 'STU2024001',
            amount: 500,
            description: 'Course Registration',
            method: 'Card',
            status: 'pending',
            createdAt: '2024-02-01T09:15:00Z',
            transactionId: null
        }
    ];

    // Mock city search responses
    const citySearchMocks = {
        'new': [
            { city: 'New York', country: 'United States', region: 'New York', population: 8419000 },
            { city: 'Newark', country: 'United States', region: 'New Jersey', population: 282000 },
            { city: 'Newport', country: 'United States', region: 'Rhode Island', population: 25000 }
        ],
        'los': [
            { city: 'Los Angeles', country: 'United States', region: 'California', population: 3898000 },
            { city: 'Los Vegas', country: 'United States', region: 'Nevada', population: 641000 }
        ],
        'london': [
            { city: 'London', country: 'United Kingdom', region: 'England', population: 8982000 }
        ]
    };

    // Mock API response with delay (simulates network latency)
    function mockResponse(data, delay = 1000, shouldSucceed = true) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldSucceed) {
                    resolve({
                        status: 'success',
                        data: data,
                        message: 'Request successful'
                    });
                } else {
                    reject({
                        status: 'error',
                        message: 'Request failed',
                        error: 'Network error'
                    });
                }
            }, delay);
        });
    }

    // Validate email (mock)
    function validateEmail(email) {
        const mockData = emailValidationMocks[email] || {
            valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            format: 'valid',
            domain: email.split('@')[1] || 'unknown',
            disposable: false,
            score: 0.7
        };
        
        return mockResponse(mockData, 800);
    }

    // Search cities (mock)
    function searchCities(query) {
        const searchKey = query.toLowerCase().substring(0, 3);
        const mockData = citySearchMocks[searchKey] || [];
        return mockResponse(mockData, 600);
    }

    // Get courses (mock)
    function getCourses(filters = {}) {
        let filtered = [...courseMocks];
        
        if (filters.department) {
            filtered = filtered.filter(c => c.department === filters.department);
        }
        if (filters.level) {
            filtered = filtered.filter(c => c.level === filters.level);
        }
        if (filters.semester) {
            filtered = filtered.filter(c => c.semester === filters.semester);
        }
        
        return mockResponse(filtered, 500);
    }

    // Get students (mock)
    function getStudents(filters = {}) {
        let filtered = [...studentMocks];
        
        if (filters.department) {
            filtered = filtered.filter(s => s.department === filters.department);
        }
        if (filters.status) {
            filtered = filtered.filter(s => s.status === filters.status);
        }
        
        return mockResponse(filtered, 700);
    }

    // Get payment history (mock)
    function getPaymentHistory(studentId = null) {
        let filtered = [...paymentHistoryMocks];
        
        if (studentId) {
            filtered = filtered.filter(p => p.studentId === studentId);
        }
        
        return mockResponse(filtered, 600);
    }

    // Process payment (mock)
    function processPayment(paymentData) {
        const random = Math.random();
        let result;
        
        if (random < 0.8) { // 80% success rate
            result = {
                ...paymentMocks.success,
                data: {
                    ...paymentMocks.success.data,
                    reference: 'PAY-' + Date.now(),
                    amount: paymentData.amount
                }
            };
        } else if (random < 0.9) { // 10% pending rate
            result = paymentMocks.pending;
        } else { // 10% failure rate
            result = paymentMocks.failed;
        }
        
        return mockResponse(result, 2000);
    }

    // Generate receipt (mock)
    function generateReceipt(paymentId) {
        const payment = paymentHistoryMocks.find(p => p.id === paymentId) || {
            id: paymentId,
            amount: 1000,
            description: 'Tuition Payment',
            method: 'Paystack',
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        
        return mockResponse({
            receipt: payment,
            pdf: 'base64-encoded-pdf-data' // In real app, this would be actual PDF
        }, 1500);
    }

    // Public API
    return {
        validateEmail,
        searchCities,
        getCourses,
        getStudents,
        getPaymentHistory,
        processPayment,
        generateReceipt
    };
})();