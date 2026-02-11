const axios = require('axios');

async function testMessAPI() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token obtained.');

        // 2. Get Mess
        const messRes = await axios.get('http://localhost:5000/api/mess/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Mess API Response:', JSON.stringify(messRes.data, null, 2));

        if (messRes.data.mess && messRes.data.mess.unique_code) {
            console.log('SUCCESS: unique_code is present:', messRes.data.mess.unique_code);
        } else {
            console.log('FAILURE: unique_code is MISSING or structure is wrong.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testMessAPI();
