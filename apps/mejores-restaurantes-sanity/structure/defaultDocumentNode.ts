import {DefaultDocumentNodeResolver} from 'sanity/structure'
import React from 'react'

export const getDefaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  // For all other schema types, just use the form view
  return S.document().views([S.view.form()])
}
