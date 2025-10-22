#!/usr/bin/env node

// Quick script to verify NextAuth environment variables
// Run with: node scripts/check-auth-env.js

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const requiredVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'RESEND_API_KEY',
    'EMAIL_FROM'
]

console.log('🔍 Checking NextAuth Environment Variables...\n')

let allGood = true

requiredVars.forEach(varName => {
    const value = process.env[varName]
    const status = value ? '✅' : '❌'
    const display = value
        ? (varName.includes('PASSWORD') || varName.includes('SECRET')
            ? '***hidden***'
            : value)
        : 'MISSING'

    console.log(`${status} ${varName}: ${display}`)

    if (!value) {
        allGood = false
    }
})

console.log('\n' + '='.repeat(50))

if (allGood) {
    console.log('✅ All environment variables are set!')
    console.log('\n🚀 You can now test magic link authentication')
    console.log('   Visit: http://localhost:3000/auth/signin')
} else {
    console.log('❌ Some variables are missing')
    console.log('\n📝 Add them to your .env.local file')
    console.log('   See: .env.example for reference')
}

console.log('='.repeat(50) + '\n')
