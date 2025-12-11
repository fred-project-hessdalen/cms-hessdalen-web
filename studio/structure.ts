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
    "forumPost",
    "forumPostType",
    "forumPostResponse",
    "recommendation",
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
                .icon(() => "🔲")
                .child(
                    S.documentTypeList("part")
                        .title("Parts")
                        .defaultOrdering([{ field: "title", direction: "asc" }])
                ),

            S.listItem()
                .title("Pages")
                .schemaType("page")
                .icon(() => "🌍")
                .child(
                    S.documentTypeList("page")
                        .title("Pages")
                        .defaultOrdering([{ field: "path", direction: "asc" }])
                ),


            S.listItem()
                .title("News")
                .schemaType("news")
                .icon(() => "📰")
                .child(
                    S.documentTypeList("news")
                        .title("News")
                        .defaultOrdering([{ field: "publishedHereDate", direction: "desc" }])
                ),


            S.listItem()
                .title("Posts")
                .schemaType("forumPost")
                .icon(() => "📌")
                .child(
                    S.documentTypeList("forumPost")
                        .title("Posts")
                        .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),

            S.listItem()
                .title("Responses")
                .schemaType("forumPostResponse")
                .icon(() => "💬")
                .child(
                    S.documentTypeList("forumPostResponse")
                        .title("Responses")
                        .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),

            S.listItem()
                .title("Recommendations")
                .schemaType("recommendation")
                .icon(() => "⭐")
                .child(
                    S.documentTypeList("recommendation")
                        .title("Recommendations")
                        .defaultOrdering([{ field: "expiresAt", direction: "asc" }])
                ),

            S.divider(),

            // --- People & Organization ---
            S.listItem()
                .title("People")
                .schemaType("person")
                .icon(() => "👤")
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
            S.documentTypeListItem("category").title("Tags / Categories").icon(() => "🔍"),

            S.divider(),

            // --- Organization Structure ---
            S.documentTypeListItem("role").title("Credit Role / Contribution"),
            S.documentTypeListItem("membershipType").title("Membership Levels"),
            S.documentTypeListItem("organizationalRole").title("Roles"),
            S.documentTypeListItem("affiliationType").title("Groups").icon(() => "👥"),

            S.documentTypeListItem("professionalTitle").title("Position"),

            S.listItem()
                .title("Forum Post Types")
                .schemaType("forumPostType")
                .icon(() => "📍")
                .child(
                    S.documentTypeList("forumPostType")
                        .title("Forum Post Types")
                        .defaultOrdering([{ field: "title", direction: "asc" }])
                ),

            S.divider(),

            // Catch-all: any other document types not explicitly listed above
            ...S.documentTypeListItems().filter((li) => !EXPLICIT.has(String(li.getId()))),
        ]);

export default structure;
