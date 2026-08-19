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
    type: z.enum(['apartment', 'house', 'villa', 'plot', 'commercial', 'mansion']),
    listingType: z.enum(['sale', 'rent']),
    status: z.enum(['available', 'pending', 'sold', 'rented']),

    layout: z.string().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    areaSqm: z.number().positive('Area in square meters is required'),
    yearBuilt: z
      .number()
      .int()
      .min(1800, 'Invalid year')
      .max(new Date().getFullYear(), 'Year built cannot be in the future')
      .optional(),

    prefectureCode: z.string().length(2, 'Prefecture code must be 2 digits, e.g. "13"'),
    cityCode: z.string().optional(),


    address: z.object({
      postalCode: z
        .string()
        .regex(/^\d{3}-?\d{4}$/, 'Invalid Japanese postal code (must be 7 digits, e.g. 106-0032 or 1060032)'),
      prefecture: z.string().min(1, 'Prefecture name is required'),
      city: z.string().min(1, 'City name is required'),
      town: z.string().optional(),
      block: z.string().optional(),
      buildingName: z.string().optional(),
      formattedAddress: z.string().min(1, 'Formatted address is required'),
      location: z
        .object({
          type: z.literal('Point').default('Point'),
          coordinates: z.tuple([z.number(), z.number()]),
        })
        .optional(),
    }),

    nearestStations: z
      .array(
        z.object({
          lineName: z.string().optional(),
          stationName: z.string().min(1, 'Station name is required'),
          walkMinutes: z.number().int().nonnegative('Walk minutes must be 0 or greater'),
        })
      )
      .optional(),

    amenities: z.array(z.string()).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url('Invalid image URL'),
          publicId: z.string().min(1, 'Image public ID is required'),
        })
      )
      .optional()
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
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export type SearchPropertyInput = z.infer<typeof searchPropertySchema>['query'];

export const updatePropertySchema = z.object({
  body: createPropertySchema.shape.body.partial(),
});

export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>["body"];

export const deleteImageSchema = z.object({
    query: z.object({
    publicId: z.string().min(1, "publicId is required")
  })
});

export type DeleteImageInput = z.infer<typeof deleteImageSchema>["query"];