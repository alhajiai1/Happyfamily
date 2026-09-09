const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the same directory
app.use(express.static(__dirname));

// Root route to serve your index.html interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Configure Nodemailer transporter with your exact app password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abualhaji52@gmail.com',
        pass: 'zyts vaan suag pcvf'
    }
});
app.post('/api/register', (req, res) => {
    const { name, email, phone, ghanaCard } = req.body;

    if (!name || !email || !phone || !ghanaCard) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
// Registration & OTP Generation Endpoint
app.post('/api/register', (req, res) => {
    const { name, email, phone, ghanaCard } = req.body;

    if (!name || !email || !phone || !ghanaCard) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const query = `INSERT INTO users (name, email, phone, ghanaCard, otp, verified) VALUES (?, ?, ?, ?, ?, 0)`;

    db.run(query, [name, email, phone, ghanaCard, otp], function(err) {
        if (err) {
            console.error('Database Error:', err.message);
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        res.json({ message: 'OTP sent successfully!' });
    });
});

        const mailOptions = {
            from: 'abualhaji52@gmail.com',
            to: email,
            subject: 'Happy Family Store - Verification Code',
            text: `Hello ${name},\n\nYour 6-digit verification code for Happy Family Store is: ${otp}\n\nThank you for shopping with us!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email Error:', error);
                return res.status(500).json({ error: 'Failed to send verification email.' });
            }
            res.json({ message: 'Verification code sent successfully.' });
        });
    });

// OTP Verification Endpoint
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        if (user.otp === otp) {
            db.run(`UPDATE users SET verified = 1, otp = NULL WHERE email = ?`, [email], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ error: 'Failed to update verification state.' });
                }
                res.json({ message: 'Verification successful!' });
            });
        } else {
            res.status(400).json({ error: 'Invalid or expired verification code.' });
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});