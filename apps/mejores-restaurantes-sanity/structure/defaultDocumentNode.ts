import {DefaultDocumentNodeResolver} from 'sanity/structure'
import React from 'react'

export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  // Add preview for city documents - location hierarchy manager
  if (schemaType === 'city') {
    return S.document().views([
      S.view.form(),
      S.view
        .component(React.lazy(() => import('../components/LocationHierarchy')))
        .title('Location Hierarchy'),
    ])
  }

  // For all other schema types, just use the form view
  return S.document().views([S.view.form()])
}
