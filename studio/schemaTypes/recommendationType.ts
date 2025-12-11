import { defineField, defineType } from 'sanity'

export const recommendationType = defineType({
    name: 'recommendation',
    title: 'Recommendation',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: "string",
        }),
        defineField({
            name: 'expiresAt',
            title: 'Expire Date',
            type: 'datetime',
            description: 'When should this recommendation expire?',
        }),
        defineField({
            name: 'person',
            title: 'Person',
            type: 'reference',
            to: [{ type: 'person' }],
            description: 'Person associated with this recommendation',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            personName: 'person.name',
            expiresAt: 'expiresAt',
        },
        prepare({ title, personName, expiresAt }) {
            const expiry = expiresAt ? new Date(expiresAt).toLocaleDateString() : 'No expiry'
            return {
                title: title || 'Untitled',
                subtitle: personName ? `${personName} • Expires: ${expiry}` : `Expires: ${expiry}`,
            }
        },
    },
})
