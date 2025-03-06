import {defineType, defineField} from 'sanity'

export const menuItemSchema = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'object',
  fields: [
    defineField({
      name: 'dishName',
      title: 'Dish Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
    }),
    defineField({
      name: 'allergens',
      title: 'Allergen Information',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          'Gluten',
          'Peanuts',
          'Tree Nuts',
          'Dairy',
          'Eggs',
          'Soy',
          'Fish',
          'Shellfish',
          // Add more allergens as needed
        ],
      },
    }),
    defineField({
      name: 'isVegetarian',
      title: 'Vegetarian',
      type: 'boolean',
    }),
    defineField({
      name: 'isVegan',
      title: 'Vegan',
      type: 'boolean',
    }),
    defineField({
      name: 'isGlutenFree',
      title: 'Gluten-Free',
      type: 'boolean',
    }),
  ],
})
