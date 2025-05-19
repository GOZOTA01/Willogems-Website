const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gabrielgozo2002@gmail.com',
        subject: `New Contact Form Message from ${name}`,
        html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        // Verify the transporter configuration
        await transporter.verify();
        console.log('Transporter configuration is valid');

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Detailed error:', error);
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