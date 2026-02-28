const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

async function testUpload() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@alumnexus.com',
            password: 'password123'
        });

        console.log('Login Response keys:', Object.keys(loginRes.data));
        const token = loginRes.data.token;
        if (!token) throw new Error("No token returned!");
        console.log('Got token');

        console.log('Uploading file...');
        const form = new FormData();
        form.append('image', fs.createReadStream('./dummy.png'));
        form.append('caption', 'Test Upload via script');
        form.append('category', 'Events');

        const uploadRes = await axios.post('http://localhost:5001/api/gallery', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload Success:', uploadRes.data);
    } catch (err) {
        console.error('FULL ERROR:', err);
        if (err.response) {
            console.error('API Error:', err.response.data);
        }
    }
}

testUpload();
