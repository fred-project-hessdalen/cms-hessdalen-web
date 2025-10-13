// /schemas/blocks/imageBlock.ts
import { defineType, defineField } from 'sanity'

export const imageBlock = defineType({
    name: 'imageBlock',
    title: 'Image',
    type: 'image',
    options: { hotspot: true },
    fields: [
        defineField({
            name: 'layout',
            title: 'Display',
            type: 'string',
            options: {
                list: [
                    { title: 'Standard (16:9)', value: 'standard' },
                    { title: 'Banner (16:3) - Top', value: 'banner-top' },
                    { title: 'Banner (16:3) - Middle', value: 'banner' },
                    { title: 'Banner (16:3) - Bottom', value: 'banner-bottom' },
                    { title: 'Original (As Is)', value: 'original' },
                ],
                layout: 'radio',
                direction: 'vertical',
            },
            initialValue: 'standard',
        }),
        defineField({
            name: 'caption',
            type: 'string',
            title: 'Caption',
        }),
        defineField({
            name: 'alt',
            type: 'string',
            title: 'Alt text',
            description: 'Alternative text for screen readers',
        }),
        defineField({
            name: 'link',
            type: 'url',
            title: 'Link',
            description: 'URL to link this image to (optional)',
            validation: (Rule) => Rule.uri({
                scheme: ['http', 'https', 'mailto', 'tel'],
                allowRelative: true
            })
        }),
    ],
});