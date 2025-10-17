/**
 * Migration script to convert old string-based categories to new category references
 * 
 * This script:
 * 1. Finds all pages and news with old string categories
 * 2. Looks up the corresponding category document by slug
 * 3. Updates the document to reference the category document instead of using strings
 * 
 * Run with:
 * npx sanity exec migrations/migrateCategoriesToReferences.ts --with-user-token
 */

import { getCliClient } from 'sanity/cli'

const client = getCliClient()

// Mapping of old category values to slugs (from newsCategoryList)
const categorySlugMap: Record<string, string> = {
    'hessdalen': 'hessdalen',
    'international': 'international',
    'norway': 'norway',
    'scandinavia': 'scandinavia',
    'science': 'science',
    'technology': 'technology',
    'politics': 'politics',
    'history': 'history',
}

const migrateDocumentCategories = async () => {
    console.log('Starting category migration...\n')

    // Step 1: Get all category documents
    console.log('Fetching category documents...')
    const categories = await client.fetch(`*[_type == "category"] { _id, title, "slug": slug.current }`)

    // Create a map of slug -> _id for quick lookup
    const categoryIdMap: Record<string, string> = {}
    categories.forEach((cat: any) => {
        categoryIdMap[cat.slug] = cat._id
    })

    console.log(`Found ${categories.length} category documents:`)
    categories.forEach((cat: any) => console.log(`  - ${cat.title} (${cat.slug})`))
    console.log()

    // Step 2: Find all pages with old string categories
    console.log('Fetching pages with categories...')
    const pages = await client.fetch(`
        *[_type == "page" && defined(categories) && length(categories) > 0] {
            _id,
            title,
            path,
            categories
        }
    `)
    console.log(`Found ${pages.length} pages with categories\n`)

    // Step 3: Find all news with old string categories
    console.log('Fetching news articles with categories...')
    const news = await client.fetch(`
        *[_type == "news" && defined(categories) && length(categories) > 0] {
            _id,
            title,
            "slug": slug.current,
            categories
        }
    `)
    console.log(`Found ${news.length} news articles with categories\n`)

    // Step 4: Migrate pages
    console.log('Migrating pages...')
    for (const page of pages) {
        try {
            // Convert old string categories to category references
            const newCategories = page.categories
                .map((oldCat: string) => {
                    const slug = categorySlugMap[oldCat] || oldCat
                    const categoryId = categoryIdMap[slug]

                    if (!categoryId) {
                        console.warn(`  ⚠ No category found for "${oldCat}" (slug: ${slug})`)
                        return null
                    }

                    return {
                        _type: 'reference',
                        _ref: categoryId,
                    }
                })
                .filter(Boolean) // Remove null values

            if (newCategories.length > 0) {
                await client
                    .patch(page._id)
                    .set({ categories: newCategories })
                    .commit()

                console.log(`  ✓ Migrated: ${page.title} (${page.path})`)
                console.log(`    Old: [${page.categories.join(', ')}]`)
                console.log(`    New: ${newCategories.length} reference(s)`)
            } else {
                console.log(`  ⊘ Skipped: ${page.title} (no valid categories)`)
            }
        } catch (error) {
            console.error(`  ✗ Failed: ${page.title}`, error)
        }
    }
    console.log()

    // Step 5: Migrate news articles
    console.log('Migrating news articles...')
    for (const article of news) {
        try {
            // Convert old string categories to category references
            const newCategories = article.categories
                .map((oldCat: string) => {
                    const slug = categorySlugMap[oldCat] || oldCat
                    const categoryId = categoryIdMap[slug]

                    if (!categoryId) {
                        console.warn(`  ⚠ No category found for "${oldCat}" (slug: ${slug})`)
                        return null
                    }

                    return {
                        _type: 'reference',
                        _ref: categoryId,
                    }
                })
                .filter(Boolean)

            if (newCategories.length > 0) {
                await client
                    .patch(article._id)
                    .set({ categories: newCategories })
                    .commit()

                console.log(`  ✓ Migrated: ${article.title}`)
                console.log(`    Old: [${article.categories.join(', ')}]`)
                console.log(`    New: ${newCategories.length} reference(s)`)
            } else {
                console.log(`  ⊘ Skipped: ${article.title} (no valid categories)`)
            }
        } catch (error) {
            console.error(`  ✗ Failed: ${article.title}`, error)
        }
    }

    console.log('\n✅ Migration complete!')
    console.log(`\nSummary:`)
    console.log(`  - Pages processed: ${pages.length}`)
    console.log(`  - News articles processed: ${news.length}`)
}

migrateDocumentCategories()
