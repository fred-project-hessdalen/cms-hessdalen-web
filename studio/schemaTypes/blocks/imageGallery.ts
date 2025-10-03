// /schemas/blocks/imageGallery.ts
import { defineType, defineField } from 'sanity'

export const imageGallery = defineType({
    name: 'imageGallery',
    title: 'Image row',
    type: 'object',
    fields: [
        defineField({
            name: 'columns',
            title: 'Images per row',
            type: 'number',
            initialValue: 2,
            validation: (Rule) => Rule.min(2).max(3),
        }),
        defineField({
            name: 'images',
            title: 'Images',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        { name: 'caption', type: 'string', title: 'Caption' },
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alt text',
                            description: 'Describe the image for screen readers',
                            validation: (Rule) => Rule.required().warning('Add alt text for accessibility'),
                        },
                    ],
                },
            ],
            options: { layout: 'grid' },
            validation: (Rule) => Rule.min(2).max(6),
        }),
    ],
    preview: {
        select: { n: 'images.length', columns: 'columns' },
        prepare: ({ n = 0, columns = 3 }) => ({
            title: `Gallery • ${n} image${n === 1 ? '' : 's'}`,
            subtitle: `${columns} per row`,
        }),
    },
})
