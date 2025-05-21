const express = require('express');
const cors = require('cors');
const path = require('path');
const sgMail = require('@sendgrid/mail');
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

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Check if SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
        console.error('SendGrid API key is missing');
        return res.status(500).json({ 
            message: 'Server email configuration is missing',
            error: 'Email configuration error'
        });
    }

    const msg = {
        to: 'gabrielgozo2002@gmail.com',
        from: 'gabugozo@gmail.com', // verified sender
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
        console.log('Attempting to send email...');
        const response = await sgMail.send(msg);
        console.log('Email sent successfully:', response);
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
    console.log('SendGrid API Key is set:', !!process.env.SENDGRID_API_KEY);
}); 