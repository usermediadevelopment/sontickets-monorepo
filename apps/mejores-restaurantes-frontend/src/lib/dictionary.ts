import 'server-only'

const dictionaries = {
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  if (!(locale in dictionaries)) {
    locale = 'es'
  }

  return dictionaries[locale as keyof typeof dictionaries]()
} 