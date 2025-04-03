import React, {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {getLocalizedRestaurants} from '../utils/localization'

interface TranslationItem {
  _id: string
  name: string
  slug: {current: string}
  language: string
}

interface Restaurant {
  _id: string
  name: string
  slug: {current: string}
  description?: string
  language: string
  _translations?: TranslationItem[]
}

interface LocalizationExampleProps {
  defaultLanguage?: string
}

const LocalizationExample = ({defaultLanguage = 'es'}: LocalizationExampleProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [language, setLanguage] = useState(defaultLanguage)
  const [loading, setLoading] = useState(true)
  const client = useClient()

  useEffect(() => {
    const fetchLocalizedContent = async () => {
      setLoading(true)
      try {
        const query = getLocalizedRestaurants(language)
        const data = await client.fetch(query, {language})
        setRestaurants(data)
      } catch (error) {
        console.error('Error fetching localized restaurants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocalizedContent()
  }, [client, language])

  return (
    <div style={{padding: '20px'}}>
      <div style={{marginBottom: '20px'}}>
        <h1>Restaurants ({language.toUpperCase()})</h1>
        <div>
          <button
            onClick={() => setLanguage('es')}
            style={{fontWeight: language === 'es' ? 'bold' : 'normal', marginRight: '10px'}}
          >
            Spanish
          </button>
          <button
            onClick={() => setLanguage('en')}
            style={{fontWeight: language === 'en' ? 'bold' : 'normal'}}
          >
            English
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants available in {language === 'en' ? 'English' : 'Spanish'}</p>
      ) : (
        <div>
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              style={{marginBottom: '30px', border: '1px solid #eee', padding: '15px'}}
            >
              <h2>{restaurant.name}</h2>
              {restaurant.description && <p>{restaurant.description}</p>}

              {restaurant._translations && restaurant._translations.length > 0 && (
                <div style={{marginTop: '10px'}}>
                  <p>Available translations:</p>
                  <ul>
                    {restaurant._translations.map((translation) => (
                      <li key={translation._id}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setLanguage(translation.language)
                          }}
                        >
                          {translation.language === 'en' ? 'English' : 'Spanish'}:{' '}
                          {translation.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocalizationExample
