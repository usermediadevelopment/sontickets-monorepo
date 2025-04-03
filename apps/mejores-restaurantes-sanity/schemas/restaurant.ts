import {defineType, defineField} from 'sanity'
import {
  ambianceOptions,
  dietaryPreferencesOptions,
  entertainmentOptions,
  facilitiesOptions,
  paymentOptions,
  suitableForOptions,
} from './data/amenities'

export const restaurantSchema = defineType({
  name: 'restaurant',
  title: 'Restaurant',
  type: 'document',
  fieldsets: [
    {
      name: 'menu',
      title: 'Menu',
      options: {
        collapsible: true, // Allows the fieldset to be collapsed
      },
    },

    {name: 'whatsapp', title: 'WhatsApp', options: {collapsible: true}},
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'name',
      title: 'Restaurant Name',
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
    // create a new externalId to sync with another platform
    defineField({
      name: 'externalId',
      title: 'External ID',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),

    defineField({
      name: 'reservationUrl',
      title: 'Online Reservation URL',
      type: 'url',
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
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),

    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'priceRange',
      title: 'Price Range',
      type: 'object',
      fields: [
        defineField({
          name: 'minPrice',
          title: 'Minimum Price',
          type: 'number',
          validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
          name: 'maxPrice',
          title: 'Maximum Price',
          type: 'number',
          validation: (Rule) =>
            Rule.required()
              .min(0)
              .custom((maxPrice, context) => {
                const {minPrice} = context.parent as {minPrice: number}
                if (minPrice !== undefined && maxPrice !== undefined && maxPrice < minPrice) {
                  return 'Maximum price should be greater than or equal to minimum price'
                }
                return true
              }),
        }),
        defineField({
          name: 'currency',
          title: 'Currency',
          type: 'string',
          options: {
            list: [
              {title: 'COP', value: 'COP'},
              {title: 'EUR', value: 'EUR'},
              {title: 'GBP', value: 'GBP'},
              // Add more currencies as needed
            ],
          },
          initialValue: 'USD',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'email',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'array',
      of: [{type: 'socialMedia'}],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),

    // create new field to store the whatsapp number and the message to send
    defineField({
      name: 'whatsappActive',
      title: 'Is active',
      type: 'boolean',
      fieldset: 'whatsapp',
      description: 'Enable or disable the WhatsApp button',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp',
      type: 'string',
      fieldset: 'whatsapp',
      description: 'WhatsApp number to be contacted',
    }),
    // create new field to store the whatsapp message to send
    defineField({
      name: 'whatsappMessage',
      title: 'WhatsApp Message',
      type: 'string',
      fieldset: 'whatsapp',
      description: 'Message to be sent to the WhatsApp number',
    }),
  ],
})
