import { defineType, defineField } from 'sanity';

export const areaSchema = defineType({
    name: 'area',
    title: 'Area',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Area Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'city',
            title: 'City',
            type: 'reference',
            to: [{ type: 'city' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name', // Use Spanish name for slug
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
    ],
});
