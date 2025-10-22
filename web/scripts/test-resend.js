#!/usr/bin/env node

// Test script to verify Resend email sending
// Run with: node scripts/test-resend.js

require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')

console.log('📧 Testing Resend Email Service...\n')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
    try {
        console.log('📨 Sending test email via Resend...\n')

        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: 'fred@hessdalen.org', // Send to yourself
            subject: 'Test Email from Hessdalen CMS',
            html: '<p>This is a <strong>test email</strong> to verify Resend integration.</p><p>If you see this, <strong>Resend is working!</strong> 🎉</p>',
            text: 'This is a test email to verify Resend integration. If you see this, Resend is working!',
        })

        console.log('✅ Email sent successfully!')
        console.log('Message ID:', data.id)
        console.log('\n📬 Check your inbox at: fred@hessdalen.org')
        console.log('\n🎉 Resend is working! Now you can test magic links.')
        console.log('   Visit: http://localhost:3000/auth/signin\n')

    } catch (error) {
        console.error('❌ Failed to send email:', error)
        console.error('\n🔧 Troubleshooting:')
        console.error('   1. Check your RESEND_API_KEY in .env.local')
        console.error('   2. Make sure it starts with "re_"')
        console.error('   3. Verify at: https://resend.com/api-keys\n')
    }
}

testEmail()
