import { defineType, defineField } from 'sanity';

export const socialMediaSchema = defineType({
  name: 'socialMedia',
  title: 'Social Media',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Facebook', value: 'Facebook' },
          { title: 'Twitter', value: 'Twitter' },
          { title: 'Instagram', value: 'Instagram' },
          { title: 'LinkedIn', value: 'LinkedIn' },
          { title: 'TikTok', value: 'TikTok' },
          { title: 'YouTube', value: 'YouTube' },
          // Add more platforms as needed
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Profile URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({ allowRelative: false }),
    }),
  ],
});
