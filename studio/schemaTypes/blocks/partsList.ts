// /schemas/blocks/partsList.ts
import { defineType, defineField } from 'sanity'

export const partsList = defineType({
    name: 'partsList',
    title: 'Parts List',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Optional title for the list',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'Optional description for the list',
        }),
        defineField({
            name: 'highlight',
            title: 'Highlight',
            type: 'boolean',
            description: 'Use a more prominent background color',
            initialValue: false,
        }),
        defineField({
            name: 'items',
            title: 'List of Parts',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'part' }],
                },
            ],
            validation: (Rule) => Rule.min(1),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            highlight: 'highlight',
            n: 'items.length',
        },
        prepare: ({ title, highlight, n = 0 }) => ({
            title: 'Parts List: ' + (title || 'Untitled'),
            subtitle: `${highlight ? 'Highlighted' : 'Normal'} • ${n} part${n === 1 ? '' : 's'}`,
        }),
    },
})
