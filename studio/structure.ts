// /apps/studio/structure.ts
import type { StructureResolver } from "sanity/structure";

// Hide types we explicitly place, so they don't duplicate in the catch-all
const EXPLICIT = new Set([
    "siteSettings",
    "siteMenu",
    "news",
    "event",
    "venue",
    "person",
    "page",
]);

const structure: StructureResolver = (S) =>
    S.list()
        .title("Content")
        .items([
            // --- Singleton / Settings ---
            S.listItem()
                .title("Site Settings")
                .id("site-settings-singleton")
                .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.listItem()
                .title("Site Menu")
                .id("site-menu-singleton")
                .child(S.document().schemaType("siteMenu").documentId("siteMenu")),
            S.divider(),

            // --- Main content ---
            S.listItem()
                .title("Pages")
                .schemaType("page")
                .child(
                    S.documentTypeList("page")
                        .title("Pages")
                        .defaultOrdering([{ field: "path", direction: "asc" }]) // or "title"
                ),

            S.listItem()
                .title("News")
                .schemaType("news")
                .child(
                    S.documentTypeList("news")
                        .title("News")
                        .defaultOrdering([{ field: "publishedHereDate", direction: "desc" }])
                ),

            S.listItem()
                .title("Events")
                .schemaType("event")
                .child(
                    S.documentTypeList("event")
                        .title("Events")
                        .defaultOrdering([{ field: "start", direction: "asc" }])
                ),

            S.listItem()
                .title("Venues")
                .schemaType("venue")
                .child(
                    S.documentTypeList("venue")
                        .title("Venues")
                        .defaultOrdering([{ field: "name", direction: "asc" }])
                ),

            S.listItem()
                .title("People")
                .schemaType("person")
                .child(
                    S.documentTypeList("person")
                        .title("People")
                        .defaultOrdering([{ field: "name", direction: "asc" }])
                ),

            S.divider(),

            // Catch-all: any other document types not explicitly listed above
            ...S.documentTypeListItems().filter((li) => !EXPLICIT.has(String(li.getId()))),
        ]);

export default structure;
