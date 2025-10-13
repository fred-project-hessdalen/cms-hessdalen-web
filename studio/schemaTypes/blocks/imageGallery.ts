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
            initialValue: 3,
            options: {
                list: [
                    { title: '2', value: 2 },
                    { title: '3', value: 3 },
                    { title: '4', value: 4 },
                    { title: '5', value: 5 },
                    { title: '6', value: 6 },
                ],
                layout: 'radio',
                direction: 'horizontal',
            },
            validation: (Rule) => Rule.required(),
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
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                            description: 'Short title or heading for the image'
                        },
                        {
                            name: 'description',
                            type: 'array',
                            title: 'Description',
                            description: 'Detailed description with rich text formatting',
                            of: [{ type: 'block' }],
                        },
                        {
                            name: 'credit',
                            type: 'string',
                            title: 'Credit',
                            description: 'Photo credit or attribution'
                        },
                        {
                            name: 'link',
                            type: 'url',
                            title: 'Link',
                            description: 'URL to link this image to (optional)',
                            validation: (Rule) => Rule.uri({
                                scheme: ['http', 'https', 'mailto', 'tel'],
                                allowRelative: true
                            })
                        },
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
