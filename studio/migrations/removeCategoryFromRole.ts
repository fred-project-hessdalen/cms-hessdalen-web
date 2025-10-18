import { defineMigration, at, unset } from "sanity/migrate";

export default defineMigration({
    title: "Remove category field from role documents",
    documentTypes: ["role"],

    migrate: {
        document(doc, context) {
            // If document has 'category' field, remove it
            if (doc.category !== undefined) {
                return [at("category", unset())];
            }
            return [];
        },
    },
});
