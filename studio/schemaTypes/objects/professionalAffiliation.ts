import { defineType, defineField } from "sanity";

export const professionalAffiliation = defineType({
    name: "professionalAffiliation",
    title: "Professional Affiliation",
    type: "object",
    description: "External employment or professional affiliation",
    fields: [
        defineField({
            name: "title",
            title: "Job Title",
            type: "string",
            validation: (Rule) => Rule.required(),
            description: "e.g., Professor, Engineer, CEO",
        }),
        defineField({
            name: "organization",
            title: "Organization",
            type: "string",
            validation: (Rule) => Rule.required(),
            description: "e.g., NTNU, Microsoft, Independent",
        }),
        defineField({
            name: "organizationUrl",
            title: "Organization Website",
            type: "url",
            description: "Optional link to employer's website",
        }),
        defineField({
            name: "startDate",
            title: "Start Date",
            type: "date",
            description: "When they started this position",
        }),
        defineField({
            name: "endDate",
            title: "End Date",
            type: "date",
            description: "When they ended this position (leave empty if current)",
        }),
        defineField({
            name: "isPrimary",
            title: "Is Primary Position",
            type: "boolean",
            initialValue: false,
            description: "Mark as their main/current job for display priority",
        }),
        defineField({
            name: "description",
            title: "Description",
            type: "text",
            rows: 3,
            description: "Optional description of what they do/did in this role",
        }),
    ],
    preview: {
        select: {
            title: "title",
            organization: "organization",
            startDate: "startDate",
            endDate: "endDate",
            isPrimary: "isPrimary",
        },
        prepare({ title, organization, startDate, endDate, isPrimary }) {
            const dates = startDate
                ? `${new Date(startDate).getFullYear()}${endDate ? ` - ${new Date(endDate).getFullYear()}` : " - Present"}`
                : "";
            return {
                title: `${title} @ ${organization}`,
                subtitle: `${dates}${isPrimary ? " • Primary" : ""}`,
            };
        },
    },
});
