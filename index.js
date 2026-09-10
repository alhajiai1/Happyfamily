const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Configure Gmail transporter for Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.get('/', (req, res) => {
    res.send('HappyFamilyStore Backend is running successfully!');
});

app.post('/api/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    // Accept either property name so it never fails due to frontend/backend mismatch
    const ghanaCard = req.body.ghanaCard || req.body.id_card;

    if (!name || !email || !phone || !ghanaCard) {
        return res.status(400).json({ error: 'All fields (name, email, phone, and Ghana Card) are required.' });
    }

    const checkQuery = `SELECT email, phone, id_card FROM users WHERE email = ? OR phone = ? OR id_card = ?`;
    db.get(checkQuery, [email, phone, ghanaCard], (err, existingUser) => {
        if (err) {
            console.error('Database Check Error:', err.message);
            return res.status(500).json({ error: `Database Error: ${err.message}` });
        }

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'This email address is already registered.' });
            }
            if (existingUser.phone === phone) {
                return res.status(400).json({ error: 'This phone number is already registered.' });
            }
            if (existingUser.id_card === ghanaCard) {
                return res.status(400).json({ error: 'This Ghana Card ID is already registered.' });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const insertQuery = `INSERT INTO users (name, email, phone, id_card, otp, verified) VALUES (?, ?, ?, ?, ?, 0)`;
        db.run(insertQuery, [name, email, phone, ghanaCard, otp], async function(err) {
            if (err) {
                console.error('Database Insert Error:', err.message);
                return res.status(500).json({ error: `DB Insert Error: ${err.message}` });
            }

            // Send actual email via Nodemailer
            try {
                const mailOptions = {
                    from: '"Happy Family Store" <no-reply@happyfamilystore.com>',
                    to: email,
                    subject: 'Your Happy Family Store Verification Code',
                    text: `Hello ${name},\n\nYour 6-digit verification code is: ${otp}\n\nEnter this code on the website to complete your registration.\n\nThank you!`
                };

                await transporter.sendMail(mailOptions);
                console.log(`Verification email successfully sent to ${email}`);
            } catch (mailErr) {
                console.error('Failed to send email:', mailErr.message);
                return res.status(500).json({ error: 'Failed to dispatch verification email.' });
            }

            return res.status(200).json({ 
                message: 'Registration successful! Verification code sent to your email.',
                userId: this.lastID 
            });
        });
    });
});

app.post('/api/verify', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) {
            console.error('Database Verification Error:', err.message);
            return res.status(500).json({ error: `Database Error: ${err.message}` });
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

        const updateQuery = `UPDATE users SET verified = 1, otp = NULL WHERE email = ?`;
        db.run(updateQuery, [email], (updateErr) => {
            if (updateErr) {
                console.error('Database Update Error:', updateErr.message);
                return res.status(500).json({ error: `Database Error: ${updateErr.message}` });
            }

            return res.status(200).json({ message: 'Account successfully verified!' });
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});