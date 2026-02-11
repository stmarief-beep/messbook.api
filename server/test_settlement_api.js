const axios = require('axios');

async function testSettlements() {
    try {
        // You need to replace this with a valid token from your login
        const token = 'YOUR_TOKEN_HERE'; // Get from localStorage in browser

        const response = await axios.get('http://localhost:5000/api/settlements/calculate', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n='.repeat(80));
        console.log('SETTLEMENT RECOMMENDATIONS FROM SERVER');
        console.log('='.repeat(80));

        if (response.data.settlements && response.data.settlements.length > 0) {
            response.data.settlements.forEach((s, index) => {
                console.log(`\n${index + 1}. ${s.from_user_name} → ${s.to_user_name}`);
                if (s.regularAmount > 0) {
                    console.log(`   Regular Mess: ${s.regularAmount} SAR`);
                }
                if (s.guestAmount > 0) {
                    console.log(`   Guest Amount: ${s.guestAmount} SAR`);
                }
                console.log(`   Total: ${s.amount} SAR`);
            });
        } else {
            console.log('\nNo settlements needed - all balanced!');
        }

        console.log('\n' + '='.repeat(80));

    } catch (error) {
        if (error.response) {
            console.error('Server error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        console.log('\nNote: You need to provide a valid auth token to test this.');
        console.log('Login to the app, open browser console, and run:');
        console.log('  localStorage.getItem("token")');
        console.log('Then paste the token value in this script.');
    }
}

testSettlements();
