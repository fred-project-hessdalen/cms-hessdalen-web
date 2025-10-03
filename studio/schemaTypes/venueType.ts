import { defineField, defineType } from 'sanity'

export const venueType = defineType({
    name: 'venue',
    title: 'Venue for events',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            type: 'string',
        }),
        defineField({
            name: 'image',
            title: 'Venue Image',
            type: 'image',
            options: {
                hotspot: true, // Allows better image cropping in Studio
            },
        }),
        defineField({
            name: 'locationOnMap',
            title: 'Location',
            type: 'url',
            description: 'A link to the venue location on a map or to a meeting room.',
        }),
        defineField({
            name: 'details',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'capacity',
            title: 'Capacity', // A user-friendly label for the field
            type: 'number',    // The data type to store a numerical value
            description: 'The maximum number of people that can attend at this venue.', // Optional description
        }),
    ],
    preview: {
        select: {
            title: "name",
            media: "image",
            capacity: "capacity",
        },
        prepare({ title, media, capacity }) {
            return {
                title,
                subtitle: capacity ? `max: ${capacity}` : "",
                media,
            };
        },
    },
})