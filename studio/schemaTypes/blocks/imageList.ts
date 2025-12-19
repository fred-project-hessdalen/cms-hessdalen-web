// /schemas/blocks/imageList.ts
import { defineType, defineField } from 'sanity'

export const imageList = defineType({
    name: 'imageList',
    title: 'Image Cards',
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
            name: 'aspect',
            title: 'Image Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: 'Video (16:9)', value: 'video' },
                    { title: 'Portrait (9:16)', value: 'portrait' },
                    { title: 'Square (1:1)', value: 'square' },
                ],
                layout: 'radio',
            },
            initialValue: 'square',
            description: 'Choose the aspect ratio for the image',
        }),

        defineField({
            name: 'items',
            title: 'List Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'icon',
                            title: 'Icon',
                            type: 'image',
                            options: { hotspot: true },
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: 'title',
                            title: 'Title',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: 'description',
                            title: 'Description',
                            type: 'array',
                            of: [{ type: 'block' }],
                        }),
                        defineField({
                            name: 'link',
                            title: 'Link',
                            type: 'url',
                            description: 'URL to link this item to',
                            validation: (Rule) => Rule.uri({
                                scheme: ['http', 'https', 'mailto', 'tel'],
                                allowRelative: true
                            })
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            subtitle: 'description',
                            media: 'icon',
                        },
                    },
                },
            ],
            validation: (Rule) => Rule.min(1),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            highlight: 'highlight',
            aspect: 'aspect',
        },
        prepare: ({ title, highlight, aspect }) => ({
            title: 'Image Cards: ' + (title || 'Untitled'),
            subtitle: `${highlight ? 'Highlighted' : 'Normal'} • ${aspect || 'square'}`,
        }),
    },
})
