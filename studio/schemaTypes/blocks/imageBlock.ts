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
            description: 'Only applies when Display is set to "Original (As Is)"',
            hidden: ({ parent }) => parent?.layout !== 'original',
        }),
        defineField({
            name: 'width',
            title: 'Width',
            type: 'string',
            options: {
                list: [
                    { title: 'Text column', value: 'column' },
                    { title: 'Breakout', value: 'full' },
                    { title: 'Screen width', value: 'screen' },
                ],
                layout: 'radio',
            },
            initialValue: 'column',
            description: 'Only applies when Display is "Original (As Is)" and Alignment is "Center"',
            hidden: ({ parent }) => parent?.layout !== 'original' || parent?.align !== 'center',
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