import { defineField, defineType } from 'sanity'

export const eventType = defineType({
    name: 'event',
    title: 'Event',
    type: 'document',
    fieldsets: [
        {
            name: 'dateRange',
            title: 'Event Timing',
            options: { columns: 2 }, // Makes the fields appear side by side
        },
    ],
    fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({
            name: 'slug',
            type: 'slug',
            title: 'Event URL',
            options: {
                source: 'name',
            },
            validation: (Rule) =>
                Rule.required().error('Required to generate a page on the website'),
            hidden: ({ document }) => !document?.name,
        }),
        defineField({
            name: 'summary',
            title: 'Short summary',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [{ title: 'Normal', value: 'normal' }],
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Numbered', value: 'number' },
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                        ],
                    },
                },
            ],
            validation: (Rule) =>
                Rule.max(3).warning('Keep the summary short (max 3 blocks/paragraphs)'),
        }),


        defineField({
            name: 'details',
            type: 'array',
            of: [
                { type: "block" }, // rich text
                {
                    type: "image",   // image block
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'layout',
                            title: 'Display',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Standard (1600×900)', value: 'standard' },
                                    { title: 'Banner (1600×300)', value: 'banner' },
                                ],
                                layout: 'radio',
                                isHighlighted: true, // quick access in the image editor
                            },
                            initialValue: 'standard',
                        },
                        { name: 'caption', type: 'string', title: 'Caption', options: { isHighlighted: true } },
                        { name: 'alt', type: 'string', title: 'Alt text', description: 'Alternative text for screen readers' },
                    ],
                },
                { type: 'imageGallery' },
                { type: 'textColumns' },
                { type: 'callout' },

            ],
        }),
        defineField({
            name: 'image',
            title: 'Event Image',
            type: 'image',
            options: { hotspot: true },
        }),

        // 👇 Grouped fields
        defineField({
            name: 'start',
            type: 'datetime',
            fieldset: 'dateRange',
        }),
        defineField({
            name: 'end',
            type: 'datetime',
            fieldset: 'dateRange',
        }),

        defineField({
            name: 'venue',
            type: 'reference',
            to: [{ type: 'venue' }],
        }),
        defineField({
            name: "presenters",
            title: "Presenters",
            type: "array",
            of: [{ type: "credit" }],   // 👈 object, not reference
        }),
        defineField({ name: 'tickets', type: 'url' }),


    ],
    preview: {
        select: {
            title: "name",
            venue: "venue.name",
            date: "start",
            media: "image",
        },
        prepare({ title, venue, date, media }) {
            const nameFormatted = title || "Untitled event";

            let dateFormatted = "";
            if (date) {
                const d = new Date(date);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");

                dateFormatted = `${yyyy}.${mm}.${dd} ${hh}:${min}`;
            }

            return {
                title: nameFormatted,
                subtitle: venue ? `${dateFormatted} @ ${venue}` : dateFormatted,
                media,
            };
        },
    },

})
