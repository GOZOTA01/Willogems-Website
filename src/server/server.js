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

// Test email endpoint
app.get('/test-email', async (req, res) => {
    try {
        const msg = {
            to: 'gabrielgozo2002@gmail.com',
            from: 'gabugozo@gmail.com',
            subject: 'Test Email from Willogems',
            text: 'This is a test email from your website server.',
            html: '<p>This is a test email from your website server.</p>'
        };
        
        console.log('Sending test email...');
        const response = await sgMail.send(msg);
        console.log('Test email sent successfully:', response);
        res.status(200).json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        if (error.response) {
            console.error('Error response body:', error.response.body);
        }
        res.status(500).json({ 
            message: 'Error sending test email',
            error: error.message,
            details: error.response ? error.response.body : null
        });
    }
});

// Set SendGrid API key
const apiKey = process.env.SENDGRID_API_KEY;
console.log('API Key length:', apiKey ? apiKey.length : 0);
sgMail.setApiKey(apiKey);

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    console.log('=== Contact Form Submission Start ===');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
        console.error('Missing required fields:', { name, email, phone, message });
        return res.status(400).json({ 
            message: 'All fields are required',
            error: 'Validation error'
        });
    }

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
        from: {
            email: 'gabugozo@gmail.com',
            name: 'Willogems Contact Form'
        },
        replyTo: {
            email: email,
            name: name
        },
        subject: 'New Contact Form from Willogems',
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
        html: `
            <h3>New Contact Form Submission</h3>
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 10px 0;"><strong>Phone Number:</strong> ${phone}</p>
                <p style="margin: 10px 0;"><strong>Message:</strong></p>
                <p style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 5px;">${message}</p>
            </div>
        `,
        mailSettings: {
            sandboxMode: {
                enable: false
            }
        },
        trackingSettings: {
            clickTracking: {
                enable: false
            },
            openTracking: {
                enable: false
            }
        }
    };

    try {
        console.log('Attempting to send email...');
        console.log('Message configuration:', JSON.stringify(msg, null, 2));
        const response = await sgMail.send(msg);
        console.log('Email sent successfully:', JSON.stringify(response, null, 2));
        console.log('=== Contact Form Submission End ===');
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('=== Email Error Details ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.response) {
            console.error('Error response body:', JSON.stringify(error.response.body, null, 2));
        }
        console.error('Error stack:', error.stack);
        console.error('=== End Error Details ===');
        res.status(500).json({ 
            message: 'Error sending email',
            error: error.message,
            details: error.response ? error.response.body : null
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('SendGrid API Key is set:', !!process.env.SENDGRID_API_KEY);
}); 