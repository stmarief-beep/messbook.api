const axios = require('axios');

async function testExpenseAPI() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✓ Logged in successfully');

        // 2. Get Expenses
        const expenseRes = await axios.get('http://localhost:5000/api/expenses/all', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n=== EXPENSE API RESPONSE ===');
        console.log('Status:', expenseRes.status);
        console.log('Data:', JSON.stringify(expenseRes.data, null, 2));
        console.log('Number of expenses:', expenseRes.data.length);

        if (expenseRes.data.length > 0) {
            console.log('\n✓ Expenses found!');
            expenseRes.data.forEach((exp, i) => {
                console.log(`\nExpense ${i + 1}:`);
                console.log(`  Amount: $${exp.amount}`);
                console.log(`  Description: ${exp.description}`);
                console.log(`  Type: ${exp.type}`);
                console.log(`  Added by: ${exp.added_by}`);
            });
        } else {
            console.log('\n✗ No expenses found in database');
        }

    } catch (error) {
        console.error('✗ Error:', error.response ? error.response.data : error.message);
    }
}

testExpenseAPI();
