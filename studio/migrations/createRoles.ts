/**
 * Migration script to create initial role documents
 * 
 * This script creates role documents from the previous hardcoded list in credit.ts
 * 
 * Run with:
 * npx sanity exec migrations/createRoles.ts --with-user-token
 */

import { getCliClient } from 'sanity/cli'

// Roles to create (from the old credit.ts hardcoded list)
const roles = [
    // Creative Roles
    { title: "Author", slug: "author", category: "creative" },
    { title: "Editor", slug: "editor", category: "creative" },
    { title: "Illustrator", slug: "illustrator", category: "creative" },
    { title: "Designer", slug: "designer", category: "creative" },
    { title: "Copywriter", slug: "copywriter", category: "creative" },
    { title: "Technical Writer", slug: "technical-writer", category: "creative" },
    { title: "Translator", slug: "translator", category: "creative" },
    { title: "Proofreader", slug: "proofreader", category: "creative" },

    // Media Roles
    { title: "Photographer", slug: "photographer", category: "media" },
    { title: "Videographer", slug: "videographer", category: "media" },
    { title: "Presenter", slug: "presenter", category: "media" },
    { title: "Speaker", slug: "speaker", category: "media" },
    { title: "Interviewer", slug: "interviewer", category: "media" },
    { title: "Interviewee", slug: "interviewee", category: "media" },
    { title: "Captioner", slug: "captioner", category: "media" },
    { title: "Moderator", slug: "moderator", category: "media" },

    // Technical Roles
    { title: "Developer", slug: "developer", category: "technical" },
    { title: "Systems Engineer", slug: "systems-engineer", category: "technical" },
    { title: "Signal Processing Engineer", slug: "signal-processing-engineer", category: "technical" },
    { title: "Electronics Engineer", slug: "electronics-engineer", category: "technical" },
    { title: "Instrumentation Technician", slug: "instrumentation-technician", category: "technical" },
    { title: "IT Administrator", slug: "it-administrator", category: "technical" },

    // Research & Development Roles
    { title: "Researcher", slug: "researcher", category: "research_development" },
    { title: "Data Scientist", slug: "data-scientist", category: "research_development" },
    { title: "Consultant", slug: "consultant", category: "research_development" },

    // Leadership Roles
    { title: "Chief Scientist", slug: "chief-scientist", category: "leadership" },
    { title: "Project Manager", slug: "project-manager", category: "leadership" },
    { title: "Field Operations Manager", slug: "field-operations-manager", category: "leadership" },
    { title: "Supervisor", slug: "supervisor", category: "leadership" },
    { title: "Compliance Officer", slug: "compliance-officer", category: "leadership" },
    { title: "Strategic Partner", slug: "strategic-partner", category: "leadership" },

    // Support Roles
    { title: "Producer", slug: "producer", category: "support" },
    { title: "Contributor", slug: "contributor", category: "support" },
    { title: "Organizer", slug: "organizer", category: "support" },
    { title: "Reviewer", slug: "reviewer", category: "support" },
    { title: "Mentor", slug: "mentor", category: "support" },
    { title: "Trainer", slug: "trainer", category: "support" },
    { title: "Curator", slug: "curator", category: "support" },
    { title: "Adjudicator", slug: "adjudicator", category: "support" },
]

const createRoles = async () => {
    console.log('Creating roles...')
    const client = getCliClient()

    for (const role of roles) {
        const doc = {
            _type: 'role',
            title: role.title,
            slug: {
                _type: 'slug',
                current: role.slug,
            },
            category: role.category,
        }

        try {
            await client.create(doc)
            console.log(`✓ Created role: ${role.title} (${role.category})`)
        } catch (error) {
            console.error(`✗ Failed to create role: ${role.title}`, error)
        }
    }

    console.log(`\nFinished creating ${roles.length} roles!`)
}

createRoles()
    .then(() => {
        console.log('Migration completed successfully')
        process.exit(0)
    })
    .catch((error) => {
        console.error('Migration failed:', error)
        process.exit(1)
    })
