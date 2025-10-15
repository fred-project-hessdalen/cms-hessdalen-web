// /schemas/partType.ts
import { defineType, defineField } from 'sanity'

export const partType = defineType({
    name: 'part',
    title: 'Part',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'Internal name to identify this part (not displayed on the website)',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Optional title to display on the website',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: { hotspot: true },
            fields: [
                {
                    name: 'alt',
                    type: 'string',
                    title: 'Alt text',
                    description: 'Important for accessibility and SEO',
                },
            ],
        }),
        defineField({
            name: 'aspect',
            title: 'Image Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: 'Video (16:9)', value: 'video' },
                    { title: 'Square (1:1)', value: 'square' },
                ],
                layout: 'radio',
            },
            initialValue: 'video',
            description: 'Choose the aspect ratio for the image',
        }),
        defineField({
            name: 'imageURL',
            title: 'Image URL',
            type: 'url',
            description: 'Optional URL to link the image to when clicked',
        }),
        defineField({
            name: 'buttons',
            title: 'Buttons',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'name',
                            title: 'Button Name',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: 'url',
                            title: 'Button URL',
                            type: 'url',
                            validation: (Rule) => Rule.required().uri({
                                scheme: ['http', 'https', 'mailto', 'tel'],
                                allowRelative: true
                            })
                        }),
                        defineField({
                            name: 'style',
                            title: 'Button Style',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Default', value: 'default' },
                                    { title: 'Highlight', value: 'highlight' },
                                    { title: 'Text Only', value: 'text-only' },
                                ],
                                layout: 'radio',
                            },
                            initialValue: 'default',
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'name',
                            subtitle: 'url',
                            style: 'style',
                        },
                        prepare: ({ title, subtitle, style }) => ({
                            title,
                            subtitle: `${style} • ${subtitle}`,
                        }),
                    },
                },
            ],
        }),
        defineField({
            name: 'align',
            title: 'Alignment',
            type: 'string',
            options: {
                list: [
                    { title: 'Left', value: 'left' },
                    { title: 'Center', value: 'center' },
                    { title: 'Right', value: 'right' },
                ],
                layout: 'radio',
            },
            initialValue: 'left',
        }),
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Plain', value: 'plain' },
                    { title: 'Framed', value: 'framed' },
                    { title: 'Featured', value: 'featured' },
                    { title: 'Card', value: 'card' },
                ],
                layout: 'radio',
            },
            initialValue: 'plain',
        }),
    ],
    preview: {
        select: {
            name: 'name',
            title: 'title',
            layout: 'layout',
            align: 'align',
            media: 'image',
        },
        prepare: ({ name, title, layout, align, media }) => ({
            title: name || 'Part',
            subtitle: `${title ? title + ' • ' : ''}${layout} • ${align}`,
            media,
        }),
    },
})
