const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Temporary in-memory storage for OTPs
const otpStorage = {};

// Nodemailer configuration with your explicit app password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abualhaji52@gmail.com',
    pass: 'zytsvaansupcvf'
  }
});

// Serve the frontend index.html file directly from the backend root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Registration endpoint with strict validations for Email, Phone, and Ghana Card
app.post('/api/register', async (req, res) => {
  const { name, email, phone, ghanaCard } = req.body;

  if (!name || !email || !phone || !ghanaCard) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // 1. Email Validation Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address format.' });
  }

  // 2. Ghanaian Phone Number Validation Check (Accepts 0XXXXXXXXX or +233XXXXXXXXX)
  const phoneRegex = /^(?:(?:\+233|0)[2-57-9][0-9]{8})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number format. Use local (0241234567) or international (+233241234567).' });
  }

  // 3. Ghana Card Validation Check (GHA-XXXXXXXXX-X)
  const ghanaCardRegex = /^GHA-[0-9]{9}-[0-9]$/;
  if (!ghanaCardRegex.test(ghanaCard)) {
    return res.status(400).json({ success: false, message: 'Invalid Ghana Card format. Use GHA-XXXXXXXXX-X.' });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[email] = otp;

  const mailOptions = {
    from: 'abualhaji52@gmail.com',
    to: email,
    subject: 'Happy Family - Verification Code',
    text: `Hello ${name},\n\nYour verification code is: ${otp}\n\nThank you for registering!`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Nodemailer error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email. Check your app password.' });
  }
});

// Verification endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  if (otpStorage[email] && otpStorage[email] === otp) {
    delete otpStorage[email];
    return res.status(200).json({ success: true, message: 'OTP verified successfully! Welcome to Happy Family.' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});