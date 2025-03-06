import { defineType, defineField } from 'sanity';

export const countrySchema = defineType({
    name: 'country',
    title: 'Country',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Country Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'code',
            title: 'Country Code',
            type: 'string',
            validation: (Rule) => Rule.required().length(2),
        }),
        defineField({
            name: 'continent',
            title: 'Continent',
            type: 'string',
        }),
        // Add other fields as necessary
    ],
});