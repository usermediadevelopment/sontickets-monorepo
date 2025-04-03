# Mejores Restaurantes - Document Localization

This document describes how to use document localization features in the Mejores Restaurantes Sanity project.

## Overview

Document-level internationalization has been implemented using the `@sanity/document-internationalization` plugin. This approach creates separate documents for each language with automatic linking between translations.

Currently supported languages:

- Spanish (es) - Default
- English (en)

## Schema Structure

The following document types are enabled for internationalization:

- `restaurant`
- `location`
- `category`

Each of these types have been updated to include a `language` field that the plugin manages automatically.

## Creating Translated Content

To create a translated version of a document:

1. Open the document in the Sanity Studio
2. Look for the languages dropdown in the header (it shows the current language)
3. Click on it and select "Create new translation"
4. Choose the target language
5. A new document will be created with the same structure, linked to the original

## Querying Localized Content

The standard way to query localized content is to filter by the `language` field:

```groq
*[_type == "restaurant" && language == $language]{
  _id,
  name,
  slug,
  description,
  language,
  // Additional fields...
}
```

### Getting Translation References

To retrieve available translations for a document:

```groq
*[_type == "restaurant" && language == $language]{
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
}
```

## Frontend Implementation

The project includes example components and utility functions:

1. `utils/localization.ts` - Contains reusable query functions
2. `components/LocalizationExample.tsx` - A React component demonstrating how to fetch and display content in different languages

### Example Usage in Next.js

```typescript
import {client} from '@/config/sanity/client'
import {getLocalizedRestaurants} from '@/utils/localization'

export async function getServerSideProps({locale}) {
  // Fallback to 'es' if locale is not available
  const language = locale || 'es'

  const query = getLocalizedRestaurants(language)
  const restaurants = await client.fetch(query, {language})

  return {
    props: {
      restaurants,
    },
  }
}
```

## Best Practices

1. Always include the language parameter in your queries
2. Set a default language fallback (typically 'es' for this project)
3. When creating new schemas that need internationalization, add them to the plugin configuration in `sanity.config.ts`
4. Consider structure organization to separate content by language in the Sanity Studio
