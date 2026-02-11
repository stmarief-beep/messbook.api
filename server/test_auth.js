const http = require('http');

const postData = JSON.stringify({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
});

const optionsRequest = (path, method, data, token = null) => {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data ? data.length : 0
        }
    };
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    return options;
};

const makeRequest = (options, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
};

async function testAuth() {
    try {
        console.log("1. Registering User...");
        const regRes = await makeRequest(optionsRequest('/api/auth/register', 'POST', postData), postData);
        console.log("Register Response:", regRes);

        if (regRes.token) {
            console.log("2. Logging in...");
            const loginData = JSON.stringify({ email: 'admin@test.com', password: 'password123' });
            const loginRes = await makeRequest(optionsRequest('/api/auth/login', 'POST', loginData), loginData);
            console.log("Login Response:", loginRes);

            console.log("3. Getting User Profile...");
            const meRes = await makeRequest(optionsRequest('/api/auth/me', 'GET', null, loginRes.token), null);
            console.log("Me Response:", meRes);
        } else if (regRes.message === 'User already exists') {
            console.log("User exists, trying login...");
            const loginData = JSON.stringify({ email: 'admin@test.com', password: 'password123' });
            const loginRes = await makeRequest(optionsRequest('/api/auth/login', 'POST', loginData), loginData);
            console.log("Login Response:", loginRes);

            if (loginRes.token) {
                console.log("3. Getting User Profile...");
                const meRes = await makeRequest(optionsRequest('/api/auth/me', 'GET', null, loginRes.token), null);
                console.log("Me Response:", meRes);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

testAuth();
