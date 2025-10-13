// /schemas/blocks/textColumns.ts
import { defineType, defineField } from 'sanity'

export const textColumns = defineType({
    name: 'textColumns',
    title: 'Text columns',
    type: 'object',
    fields: [
        defineField({
            name: 'cols',
            title: 'Number of columns',
            type: 'number',
            initialValue: 2,
            options: {
                list: [
                    { title: '2', value: 2 },
                    { title: '3', value: 3 },
                    { title: '4', value: 4 },
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
                { type: 'block' },
                { type: 'image', options: { hotspot: true } },
            ],
        }),
    ],
    preview: {
        select: { cols: 'cols', first: 'content.0.children.0.text' },
        prepare: ({ cols, first }) => ({
            title: `Text columns (${cols})`,
            subtitle: first || '—',
        }),
    },
})
