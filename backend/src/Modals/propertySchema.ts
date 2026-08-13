import { Schema, model, Document, Types } from 'mongoose';

export interface IProperty extends Document {
  title: { 
    ja: string; 
    en?: string;
  };
  description: { 
    ja: string;
    en?: string
  };
  price: number;
  type: 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
  listingType: 'sale' | 'rent';
  status: 'available' | 'pending' | 'sold' | 'rented';

  // Property Layout
  layout?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm: number;
  yearBuilt?: number;


  prefectureCode: string; 
  cityCode?: string;      


  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    town?: string;
    block?: string;
    buildingName?: string;
    formattedAddress: string;
    location?: { type: 'Point'; coordinates: [number, number] };
  };

  nearestStations?: {
    lineName?: string;
    stationName: string;
    walkMinutes: number;
  }[];


  amenities: string[];
  images: { 
    url: string; 
    publicId: string;
  }[];
  agent: Types.ObjectId;
  translationStatus: {
    title: 'human' | 'machine' | 'missing';
    description: 'human' | 'machine' | 'missing';
  };
  views: number;
  createdAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: {
      ja: { type: String, required: true, trim: true },
      en: { type: String, trim: true },
    },
    description: {
      ja: { type: String, required: true },
      en: { type: String },
    },
    price: { type: Number, required: true },
    type: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial'],
      required: true
    },
    listingType: { type: String, enum: ['sale', 'rent'], required: true },
    status: {
      type: String,
      enum: ['available', 'pending', 'sold', 'rented'],
      default: 'available'
    },
    
    layout: { type: String, trim: true },
    bedrooms: Number,
    bathrooms: Number,
    areaSqm: { type: Number, required: true },
    yearBuilt: Number,

    prefectureCode: { type: String, required: true },
    cityCode: { type: String, index: true },
    
    address: {
      postalCode: { type: String, trim: true, required: true },
      prefecture: { type: String, required: true },
      city: { type: String, required: true },
      town: String,
      block: String,
      buildingName: String,
      formattedAddress: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined },
      },
    },

    nearestStations: [
      {
        lineName: String,
        stationName: { type: String, required: true },
        walkMinutes: { type: Number, required: true },
      },
    ],

    amenities: [String],
    images: [{ url: String, publicId: String }],
    agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    translationStatus: {
      title: { type: String, enum: ['human', 'machine', 'missing'], default: 'missing' },
      description: { type: String, enum: ['human', 'machine', 'missing'], default: 'missing' },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// =============================================================================
// DATABASE INDEXES
// =============================================================================

// Prefecture Search & Sorting
propertySchema.index({ status: 1, prefectureCode: 1, createdAt: -1, price: 1 });

// City/Ward Search & Sorting
propertySchema.index({ status: 1, cityCode: 1, createdAt: -1, price: 1 });

// GeoSpatial
propertySchema.index({ 'address.location': '2dsphere' });

// English text search
propertySchema.index({ 'title.en': 'text', 'description.en': 'text' });

// Agent Dashboard
propertySchema.index({ agent: 1, createdAt: -1 });

// Category Filtering
propertySchema.index({ type: 1, listingType: 1 });

export const Property = model<IProperty>('Property', propertySchema);
