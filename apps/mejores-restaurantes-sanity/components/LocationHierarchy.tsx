import React, {useState, useEffect} from 'react'
import {useClient} from 'sanity'

type SubzoneData = {
  _id: string
  name: string
  slug?: {
    current: string
  }
}

type LocationData = {
  _id: string
  name: string
  slug?: {
    current: string
  }
  subzones?: SubzoneData[]
}

export function CityLocationManager({document}: {document: any}) {
  const client = useClient({apiVersion: '2023-05-03'})
  const [cityData, setCityData] = useState<any>(null)
  const [zones, setZones] = useState<LocationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const cityId = document.displayed._id

  useEffect(() => {
    if (!cityId) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch city data
        const city = await client.fetch(`*[_type == "city" && _id == $cityId][0]`, {cityId})
        setCityData(city)

        // Fetch zones for this city
        const zonesData = await client.fetch(
          `*[_type == "area" && city._ref == $cityId]{
            _id,
            name,
            slug,
            "subzones": *[_type == "subzone" && zone._ref == ^._id]{_id, name, slug}
          }`,
          {cityId},
        )
        setZones(zonesData)
      } catch (error) {
        console.error('Error fetching location data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [cityId, client])

  const handleCreateZone = async () => {
    if (!cityData) return

    // Create a draft zone document
    const draftId = `drafts.zone-${Date.now()}`
    const doc = {
      _id: draftId,
      _type: 'area',
      name: `New Zone in ${cityData.name}`,
      city: {
        _type: 'reference',
        _ref: cityId,
      },
    }

    try {
      await client.create(doc)
      // Redirect to edit the new document
      window.location.href = `/mejores-restaurantes-sanity/desk/area;${draftId}`
    } catch (error) {
      console.error('Error creating zone:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4">
      <div className="text-xl font-semibold mb-4">
        Location Hierarchy for {cityData?.name || 'City'}
      </div>

      <div className="p-3 bg-blue-50 rounded-md mb-4 flex justify-between items-center">
        <div>Zones in this city: {zones.length}</div>
        <button
          className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded"
          onClick={handleCreateZone}
        >
          Add new zone
        </button>
      </div>

      {zones.length > 0 ? (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone._id} className="p-3 border rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{zone.name}</div>
                <button
                  className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => {
                    window.location.href = `/mejores-restaurantes-sanity/desk/area;${zone._id}`
                  }}
                >
                  Edit
                </button>
              </div>

              {zone.subzones && zone.subzones.length > 0 ? (
                <div className="mt-2">
                  <div className="text-sm font-semibold mb-1">Subzones:</div>
                  <div className="flex flex-wrap gap-2">
                    {zone.subzones.map((subzone: any) => (
                      <button
                        key={subzone._id}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        onClick={() => {
                          window.location.href = `/mejores-restaurantes-sanity/desk/subzone;${subzone._id}`
                        }}
                      >
                        {subzone.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No subzones yet</div>
              )}

              <button
                className="mt-3 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                onClick={async () => {
                  // Create a draft subzone
                  const draftId = `drafts.subzone-${Date.now()}`
                  const doc = {
                    _id: draftId,
                    _type: 'subzone',
                    name: `New Subzone in ${zone.name}`,
                    zone: {
                      _type: 'reference',
                      _ref: zone._id,
                    },
                  }
                  try {
                    await client.create(doc)
                    window.location.href = `/mejores-restaurantes-sanity/desk/subzone;${draftId}`
                  } catch (error) {
                    console.error('Error creating subzone:', error)
                  }
                }}
              >
                Add subzone
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>No zones have been added to this city yet.</div>
      )}
    </div>
  )
}

export default function LocationHierarchy(props: any) {
  return <CityLocationManager document={props.document} />
}
