import { defineType } from 'sanity'

export default defineType({
  name: 'customHtmlEmbed',
  title: 'Custom HTML Embed',
  type: 'object',
  fields: [
    {
      name: 'html',
      title: 'HTML Code',
      type: 'text',
      description: 'Paste your custom HTML code here (e.g., iframe, script tags, widgets, etc.)',
      validation: Rule => Rule.required().min(1).error('HTML code is required'),
    },
    {
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      description: 'Optional caption to describe what this embed is',
    },
  ],
  preview: {
    select: {
      caption: 'caption',
      html: 'html',
    },
    prepare({ caption, html }) {
      // Extract a preview from the HTML (look for common patterns)
      let preview = 'Custom HTML Embed'
      
      if (html) {
        // Try to extract meaningful info from HTML
        if (html.includes('iframe')) {
          preview = 'Iframe Embed'
        } else if (html.includes('script')) {
          preview = 'Script Embed'
        } else if (html.includes('video')) {
          preview = 'Video Embed'
        } else if (html.includes('form')) {
          preview = 'Form Embed'
        }
      }
      
      return {
        title: caption || preview,
        subtitle: html ? `${html.substring(0, 50)}...` : 'No HTML code',
      }
    },
  },
})