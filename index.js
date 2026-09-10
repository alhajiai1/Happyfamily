const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('HappyFamilyStore Backend is running successfully!');
});

// Secure Registration Endpoint
app.post('/api/register', (req, res) => {
    const { name, email, phone, ghanaCard } = req.body;

    // 1. Comprehensive input validation
    if (!name || !email || !phone || !ghanaCard) {
        return res.status(400).json({ error: 'All fields (name, email, phone, and Ghana Card) are required.' });
    }

    // 2. Proactive check for existing unique identifiers to give clear user feedback
    const checkQuery = `SELECT email, phone, ghanaCard FROM users WHERE email = ? OR phone = ? OR ghanaCard = ?`;
    db.get(checkQuery, [email, phone, ghanaCard], (err, existingUser) => {
        if (err) {
            console.error('Database Check Error:', err.message);
            return res.status(500).json({ error: 'A server error occurred. Please try again.' });
        }

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'This email address is already registered.' });
            }
            if (existingUser.phone === phone) {
                return res.status(400).json({ error: 'This phone number is already registered.' });
            }
            if (existingUser.ghanaCard === ghanaCard) {
                return res.status(400).json({ error: 'This Ghana Card ID is already registered.' });
            }
        }

        // 3. Generate a secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 4. Insert the new user safely
        const insertQuery = `INSERT INTO users (name, email, phone, ghanaCard, otp, verified) VALUES (?, ?, ?, ?, ?, 0)`;
        db.run(insertQuery, [name, email, phone, ghanaCard, otp], function(err) {
            if (err) {
                console.error('Database Insert Error:', err.message);
                return res.status(500).json({ error: 'Failed to create user account. Please try again.' });
            }

            // Log OTP server-side for testing (ready for email service integration)
            console.log(`Generated OTP for ${email}: ${otp}`);

            return res.status(200).json({ 
                message: 'Registration successful! Verification code generated.',
                userId: this.lastID 
            });
        });
    });
});

// Secure OTP Verification Endpoint
app.post('/api/verify', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) {
            console.error('Database Verification Error:', err.message);
            return res.status(500).json({ error: 'A server error occurred.' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User account not found.' });
        }

        if (user.verified === 1) {
            return res.status(400).json({ error: 'This account is already verified.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid verification code provided.' });
        }

        // Update verification status and clear OTP
        const updateQuery = `UPDATE users SET verified = 1, otp = NULL WHERE email = ?`;
        db.run(updateQuery, [email], (updateErr) => {
            if (updateErr) {
                console.error('Database Update Error:', updateErr.message);
                return res.status(500).json({ error: 'Failed to verify account.' });
            }

            return res.status(200).json({ message: 'Account successfully verified!' });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});