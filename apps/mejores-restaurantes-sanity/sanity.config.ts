import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

import {googleMapsInput} from '@sanity/google-maps-input'

export default defineConfig({
  name: 'default',
  title: 'Sontickets - Mejores restaurantes',

  projectId: '7d9e3dzz',
  dataset: process.env.SANITY_STUDIO_API_DATASET || 'production',

  plugins: [
    structureTool(),
    visionTool(),
    googleMapsInput({
      defaultLocale: 'es',
      defaultZoom: 12,
      defaultLocation: {
        lat: 4.711,
        lng: -74.0721,
      },
      apiKey: 'AIzaSyDLy8EfZsZTcMbvN9FOPQ4fW8k56sDk5bc',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
