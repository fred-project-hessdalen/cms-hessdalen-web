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


  console.log("Name,Email,Link,Public");
  people.forEach((person: any) => {
    const url = `https://cms-hessdalen-web.vercel.app/profile/${person.profileToken}`
    console.log(`${person.name}`
      + `,${person.email}`
      + `,${url}`
      + `,${person.isPublic !== false ? 'Yes' : 'No'}`)
  })

}

getProfileLinks().catch(console.error)
