import {defineType, defineField} from 'sanity'

export const areaSchema = defineType({
  name: 'area',
  title: 'Zone',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Zone Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
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
      name: 'isPopular',
      title: 'Popular Zone',
      type: 'boolean',
      description: 'Mark this zone as popular or well-known',
      initialValue: false,
    }),
  ],
})
