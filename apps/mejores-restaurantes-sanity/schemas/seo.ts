import { defineType, defineField } from 'sanity';

export const seoSchema = defineType({
    name: 'seo',
    title: 'SEO Settings',
    type: 'object',
    fields: [
        defineField({
            name: 'metaTitle',
            title: 'Meta Title',
            type: 'string',
            validation: (Rule) => Rule.max(60),
        }),
        defineField({
            name: 'metaDescription',
            title: 'Meta Description',
            type: 'text',
            validation: (Rule) => Rule.max(160),
        }),
        defineField({
            name: 'keywords',
            title: 'Keywords',
            type: 'array',
            of: [{ type: 'string' }],
        }),
    ],
});
