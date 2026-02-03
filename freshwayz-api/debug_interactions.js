
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:3064';
const JWT_SECRET = 'supersecretkey';

async function debugLike() {
    try {
        // 1. Register a new customer
        const phone = `999${Math.floor(Math.random() * 10000000)}`;
        const email = `test.cust.${Date.now()}@example.com`;

        console.log(`Registering new customer: ${email} / ${phone}`);

        let customerId;
        try {
            const regRes = await axios.post(`${API_BASE}/auth/register/customer`, {
                customer: {
                    fullName: "Test Customer",
                    email: email,
                    phone: phone,
                    gender: "Male" // Optional but good to have
                },
                username: phone,
                password: "password123",
                confirmPassword: "password123"
            });
            console.log("Registration success:", JSON.stringify(regRes.data));

            // Extract ID
            customerId = regRes.data.profileId; // from auth service login-like response?
            if (!customerId && regRes.data.localUser) customerId = regRes.data.localUser.id;

        } catch (e) {
            console.log("Registration failed.");
            if (e.response) {
                console.log("Status:", e.response.status);
                // console.log("Data:", JSON.stringify(e.response.data));
                console.log("Message:", e.response.data.message);
            } else {
                console.log("Error:", e.message);
            }
        }

        if (!customerId) {
            console.log("Trying login as fallback...");
            try {
                const loginRes = await axios.post(`${API_BASE}/auth/login`, {
                    username: phone,
                    password: "password123"
                });
                console.log("Login success.");
                customerId = loginRes.data.profileId;
            } catch (e) {
                console.log("Login failed too.");
            }
        }

        if (!customerId) {
            console.error("STILL NO CUSTOMER ID. ABORT.");
            return;
        }

        console.log(`Using Customer ID: ${customerId}`);

        // 2. Generate Token
        // Payload must match AuthService structure from login:
        // const payload = { username: auth.username, sub: auth.id, role, profileId };
        // But for toggleLike, it uses req.user.profileId.
        // Wait, AuthService.login signs with sub=auth.id.
        // But our controller uses req.user.profileId.
        // So we just need profileId in payload?
        // Actually, if we use the token from LOGIN, it's correct.
        // If we generate our own, we must match structure.

        // Let's rely on manually generated token for consistent testing of "if token is correct"
        const payload = {
            sub: 99999, // Fake auth ID
            profileId: customerId,
            role: 'Customer',
            username: phone
        };
        const token = jwt.sign(payload, JWT_SECRET);

        // 3. Find Post
        const postsRes = await axios.get(`${API_BASE}/marketing`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const posts = postsRes.data;
        if (!posts || posts.length === 0) return console.error("No marketing posts found.");
        const validPostId = posts[0].id;
        console.log(`Using Post ID: ${validPostId}`);

        // 4. Like
        console.log("Liking...");
        const likeRes = await axios.post(`${API_BASE}/marketing/${validPostId}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Like Success! Result:", likeRes.data);

    } catch (error) {
        console.error("FAIL!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

debugLike();
