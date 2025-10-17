/**
 * Migration script to create Category documents from the old newsCategoryList
 * 
 * Run this in the Sanity Studio Vision tool or as a migration script:
 * 
 * 1. Go to Vision in Sanity Studio
 * 2. Copy the category data below
 * 3. For each category, create a new document using the Studio UI or API
 * 
 * Or use the Sanity CLI:
 * npx sanity exec migrations/createCategories.ts --with-user-token
 */

// Import the Sanity client
import { getCliClient } from 'sanity/cli'

// Categories to create (from the old newsCategoryList)
const categories = [
    { title: "Hessdalen", slug: "hessdalen", description: "News and updates about Hessdalen" },
    { title: "International", slug: "international", description: "International news and events" },
    { title: "From Norway", slug: "norway", description: "News from Norway" },
    { title: "From Scandinavia", slug: "scandinavia", description: "News from Scandinavian countries" },
    { title: "Science", slug: "science", description: "Scientific research and discoveries" },
    { title: "Technology", slug: "technology", description: "Technology and innovation news" },
    { title: "Politics", slug: "politics", description: "Political news and updates" },
    { title: "History", slug: "history", description: "Historical news and archives" },
];

const client = getCliClient()

const createCategories = async () => {
    console.log('Creating categories...')

    for (const category of categories) {
        try {
            const doc = await client.create({
                _type: 'category',
                title: category.title,
                slug: {
                    _type: 'slug',
                    current: category.slug,
                },
                description: category.description,
            })
            console.log(`✓ Created category: ${doc.title}`)
        } catch (error) {
            console.error(`✗ Failed to create category: ${category.title}`, error)
        }
    }

    console.log('Migration complete!')
}

createCategories()
