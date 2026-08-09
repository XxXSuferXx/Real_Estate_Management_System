import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.object({
      ja: z.string().min(5, 'Japanese title must be at least 5 characters').max(150),
      en: z.string().max(150).optional(),
    }),
    description: z.object({
      ja: z.string().min(20, 'Japanese description must be at least 20 characters'),
      en: z.string().optional(),
    }),
    price: z.number().positive('Price must be a positive number'),
    type: z.enum(['apartment', 'house', 'villa', 'plot', 'commercial']),
    listingType: z.enum(['sale', 'rent']),
    prefectureCode: z.string().length(2, 'Prefecture code must be 2 digits, e.g. "13"'),
    cityCode: z.string().optional(),
    address: z.object({
      city: z.string().min(1),
      town: z.string().optional(),
      location: z
        .object({
          coordinates: z.tuple([z.number(), z.number()]),
        })
        .optional(),
    }),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    areaSqft: z.number().positive().optional(),
    amenities: z.array(z.string()).optional(),
  }),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>['body'];

export const searchPropertySchema = z.object({
  query: z.object({
    prefectureCode: z.string().length(2).optional(),
    cityCode: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    type: z.enum(['apartment', 'house', 'villa', 'plot', 'commercial']).optional(),
    listingType: z.enum(['sale', 'rent']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20), // hard cap prevents abuse
  }),
});

export type SearchPropertyInput = z.infer<typeof searchPropertySchema>['query'];