// /schemas/blocks/youtubeVideo.ts
import { defineType, defineField } from 'sanity'

export const youtubeVideo = defineType({
    name: 'youtubeVideo',
    title: 'YouTube Video',
    type: 'object',
    fields: [
        defineField({
            name: 'url',
            title: 'YouTube URL',
            type: 'url',
            description: 'Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=TvVbIMfNGGA or https://youtu.be/TvVbIMfNGGA)',
            validation: (Rule) =>
                Rule.required()
                    .uri({
                        scheme: ['http', 'https']
                    })
                    .custom((url) => {
                        if (!url) return true;
                        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
                        return isYouTube || 'Please enter a valid YouTube URL';
                    }),
        }),
        defineField({
            name: 'title',
            title: 'Video Title',
            type: 'string',
            description: 'Optional: Add a custom title for the video',
        }),
        defineField({
            name: 'aspectRatio',
            title: 'Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: '16:9 (Standard)', value: '16:9' },
                    { title: '9:16 (Shorts/Vertical)', value: '9:16' },
                    { title: '4:3 (Traditional)', value: '4:3' },
                    { title: '21:9 (Ultrawide)', value: '21:9' },
                ],
            },
            initialValue: '16:9',
        }),
    ],
    preview: {
        select: {
            url: 'url',
            title: 'title',
        },
        prepare: ({ url, title }) => ({
            title: title || 'YouTube Video',
            subtitle: url || 'No URL provided',
            media: () => '🎥',
        }),
    },
})
