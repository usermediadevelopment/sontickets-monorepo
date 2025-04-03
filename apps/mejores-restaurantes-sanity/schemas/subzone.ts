import {defineType, defineField} from 'sanity'

export const subzoneSchema = defineType({
  name: 'subzone',
  title: 'Subzone',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Subzone Name',
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
      name: 'zone',
      title: 'Zone',
      type: 'reference',
      to: [{type: 'area'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'isPopular',
      title: 'Popular Subzone',
      type: 'boolean',
      description: 'Mark this subzone as popular or well-known',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),
  ],
})
