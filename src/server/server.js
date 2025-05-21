const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../..')));

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../..', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    console.log('=== Contact Form Submission Start ===');
    console.log('Request headers:', req.headers);
    console.log('Received request body:', req.body);

    const { name, email, phone, message } = req.body;

    // Debug log for each field
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Message:', message);

    // Check if email configuration is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email configuration missing:', {
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPass: !!process.env.EMAIL_PASS
        });
        return res.status(500).json({ 
            message: 'Server email configuration is missing',
            error: 'Email configuration error'
        });
    }

    console.log('Email configuration present, proceeding with email setup');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gabrielgozo2002@gmail.com',
        subject: 'New Contact Form from Willogems',
        html: `
            <h3>New Contact Form Submission</h3>
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 10px 0;"><strong>Phone Number:</strong> ${phone}</p>
                <p style="margin: 10px 0;"><strong>Message:</strong></p>
                <p style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 5px;">${message}</p>
            </div>
        `
    };

    try {
        console.log('Attempting to verify transporter configuration...');
        await transporter.verify();
        console.log('Transporter configuration verified successfully');

        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
        console.log('=== Contact Form Submission End ===');
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('=== Email Error Details ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== End Error Details ===');
        res.status(500).json({ 
            message: 'Error sending email',
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Log the environment variables (without the password)
    console.log('Email user:', process.env.EMAIL_USER);
    console.log('Email pass is set:', !!process.env.EMAIL_PASS);
}); 