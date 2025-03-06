import { defineType, defineField } from 'sanity';

export const menuCategorySchema = defineType({
    name: 'menuCategory',
    title: 'Menu Category',
    type: 'object',
    fields: [
        defineField({
            name: 'categoryName',
            title: 'Category Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'items',
            title: 'Menu Items',
            type: 'array',
            of: [{ type: 'menuItem' }],
        }),
    ],
});