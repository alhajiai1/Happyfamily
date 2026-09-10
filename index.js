const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'Alhaj Abu 954@gmail.com',
        pass: process.env.EMAIL_PASS
    }
});

app.get('/', (req, res) => {
    res.send('HappyFamilyStore Backend is running successfully!');
});

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

        const mailOptions = {
            from: process.env.EMAIL_USER || 'Alhaj Abu 954@gmail.com',
            to: email,
            subject: 'Your HappyFamilyStore Verification Code',
            text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nPlease enter this code to verify your account.`
        };

        transporter.sendMail(mailOptions, (mailErr, info) => {
            if (mailErr) {
                console.error('Mail Error:', mailErr.message);
                return res.status(500).json({ error: 'User registered, but failed to send OTP email.' });
            }
            res.json({ message: 'OTP sent successfully!' });
        });
    });
});

app.post('/api/verify', (req, res) => {
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
                    console.error('Database Update Error:', updateErr.message);
                    return res.status(500).json({ error: 'Database error occurred.' });
                }
                res.json({ message: 'Account verified successfully!' });
            });
        } else {
            res.status(400).json({ error: 'Invalid OTP code.' });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});