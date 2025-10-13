// schemas/objects/credit.ts
import { defineType, defineField } from "sanity";

export const credit = defineType({
    name: "credit",
    title: "Credit",
    type: "object",
    fields: [
        defineField({
            name: "person",
            type: "reference",
            to: [{ type: "person" }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "role",
            type: "string",
            options: {
                list: [
                    { title: "Author", value: "author" },
                    { title: "Editor", value: "editor" },
                    { title: "Photographer", value: "photographer" },
                    { title: "Presenter", value: "presenter" },
                    { title: "Speaker", value: "speaker" },
                    { title: "Organizer", value: "organizer" },
                    { title: "Translator", value: "translator" },
                    { title: "Reviewer", value: "reviewer" },
                    { title: "Illustrator", value: "illustrator" },
                    { title: "Designer", value: "designer" },
                    { title: "Producer", value: "producer" },
                    { title: "Contributor", value: "contributor" },
                    { title: "Researcher", value: "researcher" },
                    { title: "Consultant", value: "consultant" },
                    { title: "Interviewer", value: "interviewer" },
                    { title: "Interviewee", value: "interviewee" },
                    { title: "Developer", value: "developer" },
                    { title: "Mentor", value: "mentor" },
                    { title: "Trainer", value: "trainer" },
                    { title: "Videographer", value: "videographer" },
                    { title: "Captioner", value: "captioner" },
                    { title: "Proofreader", value: "proofreader" },
                    { title: "Moderator", value: "moderator" },
                    { title: "Curator", value: "curator" },
                    { title: "Adjudicator", value: "adjudicator" },
                    { title: "Technical Writer", value: "technical_writer" },
                    { title: "Copywriter", value: "copywriter" },
                    { title: "Supervisor", value: "supervisor" },

                    // --- New R&D and Technical Roles ---
                    { title: "Data Scientist", value: "data_scientist" },
                    { title: "Systems Engineer", value: "systems_engineer" },
                    { title: "Signal Processing Engineer", value: "signal_processing_engineer" },
                    { title: "Electronics Engineer", value: "electronics_engineer" },
                    { title: "Field Operations Manager", value: "field_operations_manager" },
                    { title: "Instrumentation Technician", value: "instrumentation_technician" },

                    // --- New Leadership and Support Roles ---
                    { title: "Chief Scientist", value: "chief_scientist" },
                    { title: "Compliance Officer", value: "compliance_officer" },
                    { title: "Strategic Partner", value: "strategic_partner" },
                    { title: "IT Administrator", value: "it_administrator" },
                    { title: "Project Manager", value: "project_manager" }
                ]
            },
        }),
        defineField({
            name: "note",
            type: "string",
            description: "Optional note about this contribution",
        }),
    ],
    preview: {
        select: { title: "person.name", subtitle: "role", media: "person.image" },
    },
});
