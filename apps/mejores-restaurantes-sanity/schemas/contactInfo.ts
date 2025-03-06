import { defineType, defineField } from 'sanity';

export const contactInfoSchema = defineType({
    name: 'contactInfo',
    title: 'Contact Information',
    type: 'object',
    fields: [
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'email',
            title: 'Email Address',
            type: 'email',
        }),
        defineField({
            name: 'fax',
            title: 'Fax Number',
            type: 'string',
        }),
    ],
});
