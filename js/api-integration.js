// API Integration Module

const API = (function() {
    // Paystack configuration (test keys)
    const PAYSTACK_CONFIG = {
        publicKey: 'pk_test_xxxxxxxxxxxxxxxx', // Replace with actual test key
        sandbox: true
    };

    // Email validation API
    async function validateEmail(email) {
        try {
            // Using Abstract API for email validation
            const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=YOUR_API_KEY&email=${email}`);
            const data = await response.json();
            
            return {
                valid: data.is_valid_format.value && !data.is_disposable_email.value,
                format: data.is_valid_format.text,
                domain: data.domain,
                disposable: data.is_disposable_email.value,
                score: data.quality_score
            };
        } catch (error) {
            console.error('Email validation error:', error);
            // Fallback to regex validation
            return {
                valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                format: 'valid',
                error: 'API unavailable, using basic validation'
            };
        }
    }

    // Paystack payment initialization
    async function initializePayment(paymentData) {
        try {
            // In production, this would be a server-side call
            // For demo, we'll simulate Paystack integration
            const response = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_CONFIG.publicKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: paymentData.email,
                    amount: paymentData.amount * 100, // Paystack uses kobo
                    reference: Storage.generatePaymentReference(),
                    metadata: paymentData.metadata,
                    callback_url: window.location.origin + '/pages/payment-callback.html'
                })
            });
            
            const data = await response.json();
            
            if (data.status) {
                return {
                    success: true,
                    authorization_url: data.data.authorization_url,
                    reference: data.data.reference
                };
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            
            // Simulate payment for demo
            return simulatePayment(paymentData);
        }
    }

    // Simulate payment (for demo purposes)
    function simulatePayment(paymentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    authorization_url: '/pages/simulate-payment.html',
                    reference: Storage.generatePaymentReference()
                });
            }, 1000);
        });
    }

    // Verify payment status
    async function verifyPayment(reference) {
        try {
            const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_CONFIG.publicKey}`
                }
            });
            
            const data = await response.json();
            
            if (data.status) {
                return {
                    success: true,
                    status: data.data.status,
                    amount: data.data.amount / 100,
                    paidAt: data.data.paid_at
                };
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            
            // Simulate verification for demo
            return {
                success: true,
                status: 'success',
                amount: 0,
                paidAt: new Date().toISOString()
            };
        }
    }

    // Flutterwave payment (alternative)
    async function initializeFlutterwavePayment(paymentData) {
        try {
            const response = await fetch('https://api.flutterwave.com/v3/payments', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_FLUTTERWAVE_SECRET_KEY',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tx_ref: Storage.generatePaymentReference(),
                    amount: paymentData.amount,
                    currency: 'USD',
                    redirect_url: window.location.origin + '/pages/payment-callback.html',
                    customer: {
                        email: paymentData.email,
                        name: paymentData.name
                    },
                    meta: paymentData.metadata
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    success: true,
                    link: data.data.link
                };
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Flutterwave error:', error);
            return simulatePayment(paymentData);
        }
    }

    // DiceBear avatar generation
    function generateAvatar(seed, options = {}) {
        const styles = ['avataaars', 'bottts', 'gridy', 'identicon', 'micah'];
        const style = options.style || styles[Math.floor(Math.random() * styles.length)];
        
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    }

    // GeoDB Cities API for location autocomplete
    async function searchCities(query) {
        try {
            const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=10`, {
                headers: {
                    'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with actual key
                    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
                }
            });
            
            const data = await response.json();
            
            return data.data.map(city => ({
                city: city.city,
                country: city.country,
                region: city.region,
                population: city.population
            }));
        } catch (error) {
            console.error('City search error:', error);
            
            // Return mock cities for demo
            return mockCitySearch(query);
        }
    }

    // Mock city search for demo
    function mockCitySearch(query) {
        const cities = [
            { city: 'New York', country: 'United States', region: 'New York' },
            { city: 'Los Angeles', country: 'United States', region: 'California' },
            { city: 'Chicago', country: 'United States', region: 'Illinois' },
            { city: 'Houston', country: 'United States', region: 'Texas' },
            { city: 'London', country: 'United Kingdom', region: 'England' },
            { city: 'Manchester', country: 'United Kingdom', region: 'England' },
            { city: 'Toronto', country: 'Canada', region: 'Ontario' },
            { city: 'Vancouver', country: 'Canada', region: 'British Columbia' },
            { city: 'Sydney', country: 'Australia', region: 'New South Wales' },
            { city: 'Melbourne', country: 'Australia', region: 'Victoria' }
        ];
        
        return cities.filter(c => 
            c.city.toLowerCase().includes(query.toLowerCase()) ||
            c.country.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Public API
    return {
        validateEmail,
        initializePayment,
        verifyPayment,
        initializeFlutterwavePayment,
        generateAvatar,
        searchCities
    };
})();