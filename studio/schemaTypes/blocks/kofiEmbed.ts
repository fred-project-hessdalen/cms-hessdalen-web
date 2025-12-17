import { defineType } from 'sanity'

export default defineType({
  name: 'kofiEmbed',
  title: 'Ko-fi Donation Widget',
  type: 'object',
  fields: [
    {
      name: 'username',
      title: 'Ko-fi Username',
      type: 'string',
      description: 'Your Ko-fi username (without the @ symbol)',
      validation: Rule => Rule.required().min(1).error('Ko-fi username is required'),
      placeholder: 'projecthessdalen'
    },
    {
      name: 'widgetType',
      title: 'Widget Type',
      type: 'string',
      options: {
        list: [
          { title: 'Donation Button', value: 'button' },
          { title: 'Floating Button', value: 'floating' },
          { title: 'Panel Widget', value: 'panel' }
        ],
        layout: 'radio'
      },
      initialValue: 'button'
    },
    {
      name: 'text',
      title: 'Button Text',
      type: 'string',
      description: 'Custom text for the donation button (optional)',
      placeholder: 'Support Project Hessdalen'
    },
    {
      name: 'color',
      title: 'Button Color',
      type: 'string',
      options: {
        list: [
          { title: 'Blue (Default)', value: 'blue' },
          { title: 'Red', value: 'red' },
          { title: 'Orange', value: 'orange' },
          { title: 'Pink', value: 'pink' },
          { title: 'White', value: 'white' },
          { title: 'Black', value: 'black' }
        ]
      },
      initialValue: 'blue'
    },
    {
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      description: 'Optional caption to describe the donation widget'
    }
  ],
  preview: {
    select: {
      username: 'username',
      widgetType: 'widgetType',
      text: 'text',
      caption: 'caption'
    },
    prepare({ username, widgetType, text, caption }) {
      const widgetTypeLabels = {
        button: 'Button',
        floating: 'Floating Button', 
        panel: 'Panel Widget'
      };
      
      const widgetLabel = widgetTypeLabels[widgetType as keyof typeof widgetTypeLabels] || 'Button';
      const displayText = text || `Support ${username}`;
      
      return {
        title: caption || `Ko-fi ${widgetLabel}`,
        subtitle: `@${username} - "${displayText}"`
      }
    }
  }
})