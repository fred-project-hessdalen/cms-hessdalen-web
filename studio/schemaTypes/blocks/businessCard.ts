// /schemas/blocks/businessCard.ts
import { defineType, defineField } from 'sanity'

export const businessCard = defineType({
    name: 'businessCard',
    title: 'Business Card',
    type: 'object',
    fields: [
        defineField({
            name: 'cardPage',
            title: 'Select Card',
            type: 'reference',
            to: [{ type: 'page' }],
            description: 'Select a card page (e.g., /card/fred)',
            validation: (Rule) => Rule.required(),
            options: {
                filter: 'path match "card/*"',
            },
        }),
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            initialValue: 'horizontal',
            options: {
                list: [
                    { title: 'Horizontal', value: 'horizontal' },
                    { title: 'Vertical', value: 'vertical' },
                ],
                layout: 'radio',
            },
        }),
    ],
    preview: {
        select: {
            title: 'cardPage.title',
            path: 'cardPage.path',
            media: 'cardPage.mainImage',
            layout: 'layout',
        },
        prepare: ({ title, path, media, layout }) => ({
            title: `Business Card: ${title || 'Untitled'}`,
            subtitle: `/${path || ''} (${layout})`,
            media,
        }),
    },
})
