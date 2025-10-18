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
    "part",
    "category",
    "role",
    "membershipType",
    "organizationalRole",
    "affiliationType",
    "professionalTitle",
]);

const structure: StructureResolver = (S) =>
    S.list()
        .title("Content")
        .items([
            // --- Settings ---
            S.listItem()
                .title("Site Settings")
                .id("site-settings-singleton")
                .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.listItem()
                .title("Site Menu")
                .id("site-menu-singleton")
                .child(S.document().schemaType("siteMenu").documentId("siteMenu")),

            S.divider(),

            // --- Content ---
            S.listItem()
                .title("Parts")
                .schemaType("part")
                .child(
                    S.documentTypeList("part")
                        .title("Parts")
                        .defaultOrdering([{ field: "title", direction: "asc" }])
                ),

            S.listItem()
                .title("Pages")
                .schemaType("page")
                .child(
                    S.documentTypeList("page")
                        .title("Pages")
                        .defaultOrdering([{ field: "path", direction: "asc" }])
                ),

            S.listItem()
                .title("News")
                .schemaType("news")
                .child(
                    S.documentTypeList("news")
                        .title("News")
                        .defaultOrdering([{ field: "publishedHereDate", direction: "desc" }])
                ),



            S.divider(),

            // --- People & Organization ---
            S.listItem()
                .title("People")
                .schemaType("person")
                .child(
                    S.documentTypeList("person")
                        .title("People")
                        .defaultOrdering([{ field: "group", direction: "asc" }, { field: "name", direction: "asc" }])
                ),

            S.listItem()
                .title("Events")
                .schemaType("event")
                .child(
                    S.documentTypeList("event")
                        .title("Events")
                        .defaultOrdering([{ field: "start", direction: "asc" }])
                ),

            S.divider(),

            S.listItem()
                .title("Venues")
                .schemaType("venue")
                .child(
                    S.documentTypeList("venue")
                        .title("Venues")
                        .defaultOrdering([{ field: "name", direction: "asc" }])
                ),

            // --- Taxonomy & Classification ---
            S.documentTypeListItem("category").title("Tags / Categories"),

            S.divider(),

            // --- Organization Structure ---
            S.documentTypeListItem("role").title("Credit Role / Contribution"),
            S.documentTypeListItem("membershipType").title("Membership Levels"),
            S.documentTypeListItem("organizationalRole").title("Roles"),
            S.documentTypeListItem("affiliationType").title("Groups"),
            S.documentTypeListItem("professionalTitle").title("Position"),

            S.divider(),

            // Catch-all: any other document types not explicitly listed above
            ...S.documentTypeListItems().filter((li) => !EXPLICIT.has(String(li.getId()))),
        ]);

export default structure;
