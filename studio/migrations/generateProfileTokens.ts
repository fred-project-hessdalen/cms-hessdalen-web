import { defineMigration, at, set } from 'sanity/migrate'
import { randomUUID } from 'crypto'

export default defineMigration({
    title: 'Generate profile tokens for all people',
    documentTypes: ['person'],

    migrate: {
        document(doc, context) {
            // Only generate token if it doesn't exist
            if (!doc.profileToken) {
                return [
                    at('profileToken', set(randomUUID()))
                ]
            }
            return []
        }
    }
})
