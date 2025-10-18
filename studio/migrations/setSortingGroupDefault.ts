import { defineMigration, at, set } from "sanity/migrate";

export default defineMigration({
    title: "Set default group for people without one",
    documentTypes: ["person"],

    migrate: {
        document(doc, context) {
            // If group is null or undefined, set it to 5 (default)
            if (doc.group === null || doc.group === undefined) {
                return [at("group", set(5))];
            }
            return [];
        },
    },
});
