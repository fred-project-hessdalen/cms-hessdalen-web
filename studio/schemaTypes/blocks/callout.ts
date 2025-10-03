// /schemas/blocks/callout.ts
import { defineType, defineField } from 'sanity'

export const callout = defineType({
    name: 'callout',
    title: 'Callout',
    type: 'object',
    fields: [
        defineField({
            name: 'tone',
            title: 'Tone',
            type: 'string',
            initialValue: 'info',
            options: {
                list: [
                    { title: 'Info', value: 'info' },
                    { title: 'Success', value: 'success' },
                    { title: 'Warning', value: 'warning' },
                    { title: 'Danger', value: 'danger' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'icon',
            title: 'Icon (emoji or short text)',
            type: 'string',
            description: 'Example:💡✅⚠️❗⛔👤💬📌🚀🛩🏅🏆🥇🎯🌎🌐🔗🌟⭐🌦🎉🔍🔑🔒🔥⚡📋📒🛒 ',
            validation: (Rule) => Rule.max(3).warning('Keep it short (1–3 chars)'),
        }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
            name: 'content',
            title: 'Text',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'compact',
            title: 'Compact spacing',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: { tone: 'tone', title: 'title', icon: 'icon' },
        prepare: ({ tone, title, icon }) => ({
            title: `${icon || ''} ${title || 'Callout'}`.trim(),
            subtitle: tone,
        }),
    },
})
