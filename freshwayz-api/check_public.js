const axios = require('axios');

async function check() {
    try {
        console.log('Testing GET http://127.0.0.1:3064/marketing/16');
        const res = await axios.get('http://127.0.0.1:3064/marketing/16');
        console.log('Status:', res.status);
        console.log('Data (Sample):', JSON.stringify(res.data).substring(0, 100));
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }

    try {
        console.log('\nTesting GET http://192.168.1.44:3064/marketing/16');
        const res2 = await axios.get('http://192.168.1.44:3064/marketing/16');
        console.log('Status:', res2.status);
    } catch (err) {
        console.error('Error Network:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}
check();
