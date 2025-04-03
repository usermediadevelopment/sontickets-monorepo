/**
 * Utility functions and queries for internationalized content
 */

/**
 * Example GROQ query to fetch restaurants in a specific language
 *
 * @param {string} language - The language code (e.g., 'en', 'es')
 * @returns {string} GROQ query string
 */
export const getLocalizedRestaurants = (language: string): string => {
  return `*[_type == "restaurant" && language == $language]{
    _id,
    name,
    slug,
    description,
    language,
    // Get the translations metadata and resolve reference fields
    "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
      _id,
      name,
      slug,
      language
    }
  }`
}

/**
 * Example GROQ query to fetch locations in a specific language
 *
 * @param {string} language - The language code (e.g., 'en', 'es')
 * @returns {string} GROQ query string
 */
export const getLocalizedLocations = (language: string): string => {
  return `*[_type == "location" && language == $language]{
    _id,
    name,
    slug,
    description,
    language,
    // Get the translations metadata and resolve reference fields
    "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
      _id,
      name,
      slug,
      language
    }
  }`
}

/**
 * Example usage in a Next.js page:
 *
 * ```typescript
 * import { client } from '@/config/sanity/client'
 * import { getLocalizedRestaurants } from '@/utils/localization'
 *
 * export async function getServerSideProps({ locale }) {
 *   // Fallback to 'es' if locale is not available
 *   const language = locale || 'es'
 *
 *   const query = getLocalizedRestaurants(language)
 *   const restaurants = await client.fetch(query, { language })
 *
 *   return {
 *     props: {
 *       restaurants,
 *     },
 *   }
 * }
 * ```
 */
