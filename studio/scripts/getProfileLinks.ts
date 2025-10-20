// Run this script to get profile edit links for all people
// Usage: npx tsx scripts/getProfileLinks.ts

import { createClient } from '@sanity/client'

const client = createClient({
    projectId: 'rydrzqyk',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN, // Make sure you have this in .env
})

async function getProfileLinks() {
    const people = await client.fetch(`
    *[_type == "person" && profileToken != null] | order(name asc) {
      name,
      email,
      profileToken,
      isPublic
    }
  `)

    console.log('\n📋 Profile Edit Links:\n')
    console.log('Copy these links and send them to the respective members:\n')

    people.forEach((person: any) => {
        const url = `http://localhost:3000/profile/${person.profileToken}`
        console.log(`👤 ${person.name}`)
        console.log(`   Email: ${person.email}`)
        console.log(`   Link:  ${url}`)
        console.log(`   Public: ${person.isPublic !== false ? '✅ Yes' : '❌ No'}`)
        console.log('')
    })

    console.log(`\n📊 Total: ${people.length} people\n`)
    console.log('💡 Replace "http://localhost:3000" with your production URL when ready.\n')
}

getProfileLinks().catch(console.error)
