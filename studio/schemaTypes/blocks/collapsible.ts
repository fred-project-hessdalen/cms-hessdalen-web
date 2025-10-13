// /schemas/blocks/collapsible.ts
import { defineType, defineField } from 'sanity'

export const collapsible = defineType({
    name: 'collapsible',
    title: 'Collapsible Section',
    type: 'object',
    fields: [
        defineField({
            name: 'header',
            title: 'Header',
            type: 'string',
            description: 'The clickable header text',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            description: 'Content that will be shown/hidden when toggled',
            of: [
                { type: 'block' },
                { type: 'imageBlock' },
            ],
        }),
        defineField({
            name: 'defaultOpen',
            title: 'Open by default',
            type: 'boolean',
            description: 'Should this section be open when the page loads?',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: 'header',
            defaultOpen: 'defaultOpen',
        },
        prepare: ({ title, defaultOpen }) => ({
            title: title || 'Collapsible Section',
            subtitle: defaultOpen ? 'Open by default' : 'Closed by default',
        }),
    },
})
