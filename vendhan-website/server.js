const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. Middleware ---
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder 
// (This serves index.html, services.html, contact.html, and images automatically)
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. API Route for Contact Form ---
app.post('/api/contact', async (req, res) => {
    // Destructuring fields (Company Name is removed)
    const { fullName, email, phone, subject, message } = req.body;

    // Basic Validation
    if (!fullName || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required fields (Name, Email, Subject, or Message)." 
        });
    }

    // Console log for your debugging
    console.log("--- New Submission Received ---");
    console.log(`From: ${fullName} (${email})`);
    console.log(`Subj: ${subject}`);
    console.log("-------------------------------");

    // Configure Nodemailer Transporter
    // Make sure your .env has EMAIL_USER and EMAIL_PASS (App Password)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${fullName}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.RECEIVER_EMAIL, // Usually your own email
        subject: `[Website Contact] ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #0a1a0a;">New Message from Vendhan InfoTech Website</h2>
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to send email. Please check server logs." 
        });
    }
});

// --- 3. THE NODE v24 PATH ERROR FIX ---
// Instead of app.get('*'), we use a general middleware. 
// If the request reaches this point (meaning it wasn't a static file or an API call),
// we send the index.html file.
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 4. Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
==================================================
🚀 VENDHAN INFOTECH SERVER STARTED
==================================================
Local:            http://localhost:${PORT}
Contact Page:     http://localhost:${PORT}/contact.html
Environment:      Node.js ${process.version}
==================================================
    `);
});