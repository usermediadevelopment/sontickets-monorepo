import {defineType, defineField} from 'sanity'
import {
  ambianceOptions,
  dietaryPreferencesOptions,
  entertainmentOptions,
  facilitiesOptions,
  paymentOptions,
  suitableForOptions,
  establishmentTypes,
  foodTypes,
} from './data/amenities'

export const locationSchema = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fieldsets: [
    {
      name: 'menu',
      title: 'Menu',
      options: {
        collapsible: true, // Allows the fieldset to be collapsed
      },
    },
  ],
  fields: [
    // create a field to enable or disable the location by default it will be enabled
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Enable or disable the location',
      initialValue: false,
    }),
    // create a new externalId to sync with another platform
    defineField({
      name: 'externalId',
      title: 'External ID',
      type: 'string',
    }),
    defineField({
      name: 'name',
      title: 'Location Name',
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
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'restaurant',
      title: 'Restaurant',
      type: 'reference',
      to: [{type: 'restaurant'}],
    }),

    // I woudl like to add phone numbers to the location, the user can select the
    defineField({
      name: 'phoneNumbers',
      title: 'Phone Numbers',
      type: 'array',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'googlePlaceId',
      title: 'Google Place ID',
      type: 'string',
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
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
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
      name: 'subzones',
      title: 'Subzones',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'subzone'}]}],
      description: 'Specific subzones within the main zone',
    }),

    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'postalCode',
      title: 'Postal Code',
      type: 'string',
    }),

    defineField({
      name: 'geoLocation',
      title: 'Geolocation',
      type: 'geopoint',
    }),

    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [{type: 'image'}],
    }),

    defineField({
      name: 'awards',
      title: 'Reconocimientos',
      type: 'array',
      of: [{type: 'image'}],
    }),
    defineField({
      name: 'pdfMenuFile',
      title: 'PDF File',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      fieldset: 'menu',
    }),

    defineField({
      name: 'urlMenuFile',
      title: 'URL',
      type: 'url',
      fieldset: 'menu',
    }),
    defineField({
      name: 'schedule',
      title: 'Operating Hours',
      type: 'array',
      of: [{type: 'openingHour'}],
    }),

    defineField({
      name: 'establishmentType',
      title: 'Tipo de establecimiento',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: establishmentTypes,
      },
    }),

    defineField({
      name: 'foodType',
      title: 'Tipo de comida',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: foodTypes,
      },
    }),
    defineField({
      name: 'outstandingFeatures',
      title: 'Aspectos sobresalientes',
      type: 'array',
      of: [{type: 'string'}],
    }),

    // 1. Restricciones y Preferencias Dietéticas
    defineField({
      name: 'dietaryPreferences',
      title: 'Preferencias Dietéticas',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: dietaryPreferencesOptions,
      },
    }),

    // 2. Ambiente y Experiencia
    defineField({
      name: 'ambiance',
      title: 'Ambiente y Experiencia',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: ambianceOptions,
      },
    }),

    // 3. Servicios y Facilidades
    defineField({
      name: 'facilities',
      title: 'Servicios y Facilidades',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: facilitiesOptions,
      },
    }),

    // 4. Entretenimiento y Eventos
    defineField({
      name: 'entertainment',
      title: 'Entretenimiento y Eventos',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: entertainmentOptions,
      },
    }),

    // 6. Adecuado para
    defineField({
      name: 'suitableFor',
      title: 'Adecuado para',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: suitableForOptions,
      },
    }),

    // 9. Opciones de Pago y Reservación
    defineField({
      name: 'paymentOptions',
      title: 'Opciones de Pago y Reservación',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: paymentOptions,
      },
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'contactInfo',
    }),

    defineField({
      name: 'reservation',
      title: 'Online Reservation Available',
      type: 'boolean',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),
  ],
})
