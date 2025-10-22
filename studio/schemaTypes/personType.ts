// schemas/personType.ts
import { defineType, defineField } from "sanity";
import { countryList } from "./lists/countryList";

export const personType = defineType({
    name: "person",
    title: "Person",
    type: "document",

    // Optional: make "Sort by Group" available in Studio lists
    orderings: [
        {
            title: "Group ↑, Name ↑",
            name: "groupAscNameAsc",
            by: [
                { field: "group", direction: "asc" },
                { field: "name", direction: "asc" },
            ],
        },
    ],

    fields: [
        defineField({
            name: "name",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "slug",
            type: "slug",
            options: { source: "name" },
            validation: (Rule) => Rule.required(),
        }),

        // Sorting group (1-10 slider)
        defineField({
            name: "group",
            title: "Overall sorting Group",
            type: "number",
            description: "Priority for sorting (1 = highest priority, 10 = lowest). Chairman = 1, Core team = 2, Team = 3, Board = 4, Volunteers = 5, etc.",
            initialValue: 5,
            validation: (Rule) => Rule.required().min(1).max(10).integer(),
            options: {
                list: [
                    { title: "1 (Highest Priority)", value: 1 },
                    { title: "2", value: 2 },
                    { title: "3", value: 3 },
                    { title: "4", value: 4 },
                    { title: "5 (Default)", value: 5 },
                    { title: "6", value: 6 },
                    { title: "7", value: 7 },
                    { title: "8", value: 8 },
                    { title: "9", value: 9 },
                    { title: "10 (Lowest Priority)", value: 10 },
                ],
                layout: "dropdown",
            },
        }),


        // Organization fields
        defineField({
            name: "membershipType",
            title: "Membership Type",
            type: "reference",
            to: [{ type: "membershipType" }],
            description: "How they belong to the organization (mutually exclusive)",
        }),
        defineField({
            name: "organizationalRoles",
            title: "Organizational Roles",
            type: "array",
            of: [{ type: "reference", to: [{ type: "organizationalRole" }] }],
            description: "Function(s) they hold within the structure (can have multiple)",
        }),
        defineField({
            name: "affiliations",
            title: "Affiliations / Groups",
            type: "array",
            of: [{ type: "reference", to: [{ type: "affiliationType" }] }],
            description: "Which team(s)/unit(s) they belong to (many-to-many)",
        }),

        // Professional fields
        defineField({
            name: "professionalTitle",
            title: "Professional Title",
            type: "reference",
            to: [{ type: "professionalTitle" }],
            description: "Job title or specialization (optional, from CV or external job)",
        }),
        defineField({
            name: "professionalAffiliations",
            title: "Professional Affiliations",
            type: "array",
            of: [{ type: "professionalAffiliation" }],
            description: "External employment history and professional positions",
        }),

        // NEW: short summary above bio
        defineField({
            name: "summary",
            title: "Summary (short)",
            type: "text",
            rows: 3,
            description: "A few lines shown above the bio.",
            validation: (Rule) =>
                Rule.max(280).warning("Keep it short (≤ 280 characters)."),
        }),

        // NEW: mobile number + visibility toggle
        defineField({
            name: "mobileNumber",
            title: "Mobile number",
            type: "string",
            description: "Optional. Example: +47 400 00 000",
            // light validation: allow digits, spaces, +, -, parentheses
            validation: (Rule) =>
                Rule.regex(/^[0-9+()\-.\s]*$/).warning(
                    "Only digits, spaces and (+ - . ( ))"
                ),
        }),
        defineField({
            name: "isPublic",
            title: "Show on Public Website",
            type: "boolean",
            initialValue: true,
            description: "If unchecked, your profile will only be visible to site administrators, not on the public website",
        }),
        defineField({
            name: "canShowMobileNumber",
            title: "Show mobile number on site",
            type: "boolean",
            initialValue: false,
            description: "Allow your mobile number to be displayed publicly on the website",
            hidden: ({ document }) => !document?.isPublic,
        }),
        defineField({
            name: "canShowEmail",
            title: "Show email address on site",
            type: "boolean",
            initialValue: false,
            description: "Allow your email to be displayed publicly on the website",
            hidden: ({ document }) => !document?.isPublic,
        }),
        defineField({
            name: "profileToken",
            title: "Profile Edit Token",
            type: "string",
            readOnly: true,
            hidden: false,
            description: "Secure token for self-service profile editing (auto-generated)",
            initialValue: () => {
                // Generate UUID when creating a new person
                return crypto.randomUUID();
            },
        }),
        defineField({
            name: "authUserId",
            title: "Auth User ID",
            type: "string",
            readOnly: true,
            hidden: false,
            description: "Linked authenticated user ID from NextAuth (auto-linked when user signs in)",
        }),

        defineField({
            name: "email",
            type: "string",
            validation: (Rule) => Rule.required().email(),
        }),
        defineField({
            name: "image",
            type: "image",
            options: { hotspot: true },
        }),
        defineField({
            name: "bio",
            type: "array",
            of: [
                { type: "block" }, // rich text
                { type: 'imageBlock' },
                { type: 'imageGallery' },
                { type: 'imageList' },
                { type: 'partsList' },
                { type: 'textColumns' },
                { type: 'callout' },
                { type: 'collapsible' },
                { type: 'youtubeVideo' },
                { type: 'googleSlidesEmbed' },
                { type: 'googleDocumentEmbed' },
            ],
        }),
        defineField({
            name: "website",
            type: "url",
        }),
        defineField({
            name: "country",
            title: "Country",
            type: "string",
            options: { list: countryList },
        }),
        defineField({
            name: "socials",
            title: "Social Links",
            type: "array",
            of: [
                {
                    type: "object",
                    fields: [
                        defineField({ name: "label", type: "string" }), // e.g., X/Twitter, LinkedIn
                        defineField({ name: "url", type: "url" }),
                    ],
                    preview: { select: { title: "label", subtitle: "url" } },
                },
            ],
        }),
        defineField({
            name: "isActive",
            type: "boolean",
            initialValue: true,
        }),
    ],

    preview: {
        select: {
            title: "name",
            group: "group",
            country: "country",
            professionalTitle: "professionalTitle.title",
            membershipType: "membershipType.title",
            media: "image",
        },
        prepare({ title, group, country, professionalTitle, membershipType, media }) {
            let subtitle = `${group}`;
            if (membershipType) subtitle += ` • ${membershipType}`;
            if (professionalTitle) subtitle += ` • ${professionalTitle}`;
            if (country) subtitle += ` • ${country}`;

            return { title, subtitle, media };
        },
    },
});
