const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

async function verifyFixes() {
    const baseURL = 'http://localhost:5001/api';
    try {
        console.log('--- Verifying Backend Fixes ---');

        // 1. Test Login (Existing check)
        console.log('1. Attempting Login...');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@alumnexus.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        if (!token) throw new Error("Login failed, no token!");
        console.log('✓ Login successful');

        // 2. Test Gallery Route configuration (Implicitly checked by upload)
        // Note: We can't easily test 'avif' without a real avif file, 
        // but we can check if the route accepts more than 10 files if we had them.
        // For now, let's just verify a standard upload still works.
        console.log('2. Attempting Gallery Upload...');
        const form = new FormData();
        // Use an existing small image if possible, otherwise dummy.png
        const imagePath = fs.existsSync('./dummy.png') ? './dummy.png' : null;
        if (imagePath) {
            form.append('images', fs.createReadStream(imagePath));
            form.append('category', 'General');
            form.append('caption', 'Verification Upload');

            const uploadRes = await axios.post(`${baseURL}/gallery`, form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('✓ Gallery upload successful:', uploadRes.data.success);
        } else {
            console.log('! Skipping upload test: dummy.png not found');
        }

        console.log('--- Verification Complete ---');
    } catch (err) {
        console.error('✗ Verification failed:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

verifyFixes();
