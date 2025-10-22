#!/usr/bin/env node

// Test script to verify Gmail SMTP connection
// Run with: node scripts/test-email.js

require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')

console.log('📧 Testing Gmail SMTP Connection...\n')

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    debug: true, // Enable debug output
    logger: true, // Log information
})

// Verify connection
transport.verify(function (error, success) {
    if (error) {
        console.error('❌ Connection failed:', error)
    } else {
        console.log('✅ Server is ready to send emails')

        // Try sending a test email
        console.log('\n📨 Sending test email...\n')

        transport.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_SERVER_USER, // Send to yourself
            subject: 'Test Email from Hessdalen CMS',
            text: 'This is a test email to verify SMTP connection.',
            html: '<p>This is a <strong>test email</strong> to verify SMTP connection.</p>',
        }).then(info => {
            console.log('✅ Email sent successfully!')
            console.log('Message ID:', info.messageId)
            console.log('Response:', info.response)
        }).catch(err => {
            console.error('❌ Failed to send email:', err)
        })
    }
})
