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
      name: 'latLong',
      title: 'Location',
      type: 'geopoint',
      description: 'Latitude and longitude coordinates for the city',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
