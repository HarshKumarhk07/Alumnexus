const axios = require('axios');

async function testPasswordUpdate() {
    try {
        const dummyUser = {
            name: 'Test Setup User',
            email: `testuser${Date.now()}@example.com`,
            password: 'password123',
            role: 'student'
        };

        console.log(`[1] Registering dummy user... ${dummyUser.email}`);
        const regRes = await axios.post('http://localhost:5001/api/auth/register', dummyUser);
        const token = regRes.data.token;
        console.log(`[2] Registration successful. Token: ${token.substring(0, 15)}...`);

        console.log(`[3] Attempting to update password...`);
        const updateRes = await axios.put('http://localhost:5001/api/auth/password', {
            currentPassword: 'password123',
            newPassword: 'newpassword456'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(`[4] Password update successful!`);
        console.dir(updateRes.data);

    } catch (err) {
        console.error(`[ERROR] Password update failed:`, err.response ? err.response.data : err.message);
    }
}

testPasswordUpdate();
