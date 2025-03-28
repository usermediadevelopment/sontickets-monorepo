import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('Content')
    .items([
      // Location hierarchy
      S.listItem()
        .title('Location Management')
        .icon(() => '🌍')
        .child(
          S.list()
            .title('Location Management')
            .items([
              S.listItem()
                .title('Countries')
                .schemaType('country')
                .child(S.documentTypeList('country').title('Countries')),
              S.listItem()
                .title('Cities')
                .schemaType('city')
                .child(
                  S.documentTypeList('city')
                    .title('Cities')
                    .child((cityId) =>
                      S.list()
                        .title('City Details')
                        .items([
                          S.listItem()
                            .title('City Information')
                            .child(S.document().schemaType('city').documentId(cityId)),
                          S.listItem()
                            .title('Zones in this City')
                            .child(
                              S.documentList()
                                .title('Zones')
                                .filter('_type == "area" && city._ref == $cityId')
                                .params({cityId}),
                            ),
                        ]),
                    ),
                ),
              S.listItem()
                .title('Zones')
                .schemaType('area')
                .child(
                  S.documentTypeList('area')
                    .title('Zones')
                    .child((zoneId) =>
                      S.list()
                        .title('Zone Details')
                        .items([
                          S.listItem()
                            .title('Zone Information')
                            .child(S.document().schemaType('area').documentId(zoneId)),
                          S.listItem()
                            .title('Subzones in this Zone')
                            .child(
                              S.documentList()
                                .title('Subzones')
                                .filter('_type == "subzone" && zone._ref == $zoneId')
                                .params({zoneId}),
                            ),
                        ]),
                    ),
                ),
              S.listItem()
                .title('Subzones')
                .schemaType('subzone')
                .child(S.documentTypeList('subzone').title('Subzones')),
              S.divider(),
              S.listItem()
                .title('All Locations')
                .schemaType('location')
                .child(S.documentTypeList('location').title('Locations')),
            ]),
        ),

      // Other document types
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['country', 'city', 'area', 'subzone', 'location'].includes(listItem.getId() as string),
      ),
    ])
