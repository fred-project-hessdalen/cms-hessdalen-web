import { defineMigration } from "sanity/migrate";

export default defineMigration({
    title: "Ensure group field exists in person documents (deprecated - sortingGroup removed)",
    documentTypes: ["person"],

    migrate: {
        document(doc, context) {
            // This migration is deprecated - we now use 'group' field directly
            // No changes needed
            return [];
        },
    },
});
