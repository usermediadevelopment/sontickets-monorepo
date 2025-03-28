import {defineType, defineField} from 'sanity'

export const citySchema = defineType({
  name: 'city',
  title: 'City',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'City Name',
      type: 'string',
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
    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{type: 'country'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'City Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      country: 'country.name',
      media: 'image',
    },
    prepare(selection) {
      const {title, country, media} = selection
      return {
        title,
        subtitle: country ? `Country: ${country}` : '',
        media,
      }
    },
  },
})
