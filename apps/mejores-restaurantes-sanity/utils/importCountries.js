// Import countries into Sanity
// Run with: node importCountries.js

const { createClient } = require('@sanity/client')
require('dotenv').config()

// Configure the client
const client = createClient({
  projectId: '7d9e3dzz',
  dataset: process.env.SANITY_STUDIO_API_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN, // Need a token with write access
  apiVersion: '2023-04-01', // Use current date in ISO format
  useCdn: false,
})

// List of countries to import
const countries = [
  { name: 'Spain', code: 'ES', continent: 'Europe' },
  { name: 'United States', code: 'US', continent: 'North America' },
  { name: 'Mexico', code: 'MX', continent: 'North America' },
  { name: 'Colombia', code: 'CO', continent: 'South America' },
  { name: 'Argentina', code: 'AR', continent: 'South America' },
  { name: 'Brazil', code: 'BR', continent: 'South America' },
  { name: 'United Kingdom', code: 'GB', continent: 'Europe' },
  { name: 'France', code: 'FR', continent: 'Europe' },
  { name: 'Italy', code: 'IT', continent: 'Europe' },
  { name: 'Germany', code: 'DE', continent: 'Europe' },
  // Add more countries as needed
]

// Import the countries
async function importCountries() {
  console.log('Starting import of countries...')
  
  // Create a transaction
  const transaction = client.transaction()
  
  // Add each country to the transaction
  countries.forEach(country => {
    transaction.create({
      _type: 'country',
      name: country.name,
      code: country.code,
      continent: country.continent
    })
  })
  
  // Commit the transaction
  try {
    await transaction.commit()
    console.log(`Successfully imported ${countries.length} countries`)
  } catch (err) {
    console.error('Import failed: ', err.message)
  }
}

// Run the import
importCountries() 