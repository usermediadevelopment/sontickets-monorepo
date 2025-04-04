import {defineType, defineField} from 'sanity'

export const dishTypeSchema = defineType({
  name: 'dishType',
  title: 'Dish Type',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Dish Type Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'category',
      title: 'Cuisine Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'The cuisine category this dish type belongs to',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Enables the hotspot functionality for the image
      },
    }),
    defineField({
      name: 'popular',
      title: 'Popular Dish Type',
      type: 'boolean',
      description: 'Mark this dish type as popular or featured',
      initialValue: false,
    }),

    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),
  ],
})
