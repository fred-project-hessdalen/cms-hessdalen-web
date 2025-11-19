import { defineMigration, at, set } from 'sanity/migrate'

export default defineMigration({
  title: 'Populate displayName field with name when displayName is empty',
  documentTypes: ['person'],

  migrate: {
    document(doc, context) {
      const displayName = doc.displayName?.trim()
      const name = doc.name?.trim()
      
      // If displayName is empty or doesn't exist, set it to name
      if (!displayName || displayName === '') {
        return [
          at('displayName', set(name || ''))
        ]
      }
      
      // If displayName already has a value, don't change it
      return doc
    }
  }
})