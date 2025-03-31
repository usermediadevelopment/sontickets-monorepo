import {searchClient} from '@algolia/client-search'
const ALGOLIA_APP_ID="ZTQPHKDNRR"
const ALGOLIA_ADMIN_API_KEY="5db9f0733bcf5321e432296e9b547bee"
const ALGOLIA_SEARCH_API_KEY="89e9997fd6912a1329f79150fa0d42de"

// For ESM compatibility
/* global process, console, require, module */

// Initialize the Algolia client
const client = searchClient(
  ALGOLIA_APP_ID || '',
  ALGOLIA_ADMIN_API_KEY || '',
)

// Function to fetch amenities data from Sanity schemas
const fetchAmenitiesData = async () => {
  // Import the amenities data directly from the schema file
  const {
    dietaryPreferencesOptions,
    ambianceOptions,
    facilitiesOptions,
    entertainmentOptions,
    suitableForOptions,
    paymentOptions,
    establishmentTypes,
    foodTypes,
  } = await import('../schemas/data/amenities.js')

  // Create a structured amenities object
  const amenitiesData = {
    dietaryPreferences: dietaryPreferencesOptions,
    ambiance: ambianceOptions,
    facilities: facilitiesOptions,
    entertainment: entertainmentOptions,
    suitableFor: suitableForOptions,
    payment: paymentOptions,
    establishmentTypes: establishmentTypes,
    foodTypes: foodTypes,
  }

  return amenitiesData
}

// Function to sync amenities data to Algolia
export const syncAmenitiesToAlgolia = async () => {
  try {
    console.log('Starting to sync amenities data to Algolia...')

    // Fetch the amenities data
    const amenitiesData = await fetchAmenitiesData()

    // Create formatted records for Algolia
    const records = Object.entries(amenitiesData).map(([category, options]) => {
      return {
        objectID: category,
        category,
        options,
      }
    })

    // Save the records to Algolia - using the new API
    await client.saveObjects({
      indexName: 'amenities',
      objects: records,
    })

    console.log(`Successfully synced ${records.length} amenity categories to Algolia`)
    return true
  } catch (error) {
    console.error('Error syncing amenities data to Algolia:', error)
    return false
  }
}


  syncAmenitiesToAlgolia()
    .then(() => {
      console.log('Sync completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Sync failed:', error)
      process.exit(1)
    })
