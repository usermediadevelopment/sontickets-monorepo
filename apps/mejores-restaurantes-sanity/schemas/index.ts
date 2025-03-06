
import { categorySchema } from "./category";
import { openingHourSchema } from "./openingHour";
import { restaurantSchema } from "./restaurant";
import { reviewSchema } from "./review";
import { socialMediaSchema } from "./socialMedia";
import { locationSchema } from './location'
import { menuCategorySchema } from './menuCategory'
import { menuItemSchema } from './menuItem'
import { seoSchema } from './seo'
import { citySchema } from './city'
import { areaSchema } from './area'

import { contactInfoSchema } from './contactInfo'
import { countrySchema } from './country'

export const schemaTypes = [
  categorySchema,
  citySchema,
  locationSchema,
  menuCategorySchema,
  menuItemSchema,
  openingHourSchema,
  restaurantSchema,
  reviewSchema,
  seoSchema,
  areaSchema,
  socialMediaSchema,
  contactInfoSchema,
  countrySchema,
  // Add other schemas as needed
];