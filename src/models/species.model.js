const mongoose = require('mongoose');

const speciesSchema = new mongoose.Schema({
  commonName: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  family: {
    type: String,
    trim: true
  },
  genus: {
    type: String,
    trim: true
  },
  nativeRegion: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  characteristics: {
    maxHeight: Number,
    maxDiameter: Number,
    growthRate: {
      type: String,
      enum: ['slow', 'moderate', 'fast']
    },
    lifespan: Number,
    leafType: {
      type: String,
      enum: ['deciduous', 'evergreen', 'semi-evergreen']
    },
    flowerColor: [String],
    fruitType: String
  },
  cultivationRequirements: {
    sunlight: {
      type: String,
      enum: ['full_sun', 'partial_shade', 'full_shade']
    },
    soilType: [String],
    waterNeeds: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    hardiness_zone: String,
    temperature_tolerance: {
      min: Number,
      max: Number
    }
  },
  benefits: {
    carbon_sequestration: Number,
    oxygen_production: Number,
    air_quality_improvement: Boolean,
    wildlife_habitat: Boolean,
    erosion_control: Boolean
  },
  images: [{
    url: String,
    description: String
  }],
  isEndangered: {
    type: Boolean,
    default: false
  },
  conservationStatus: {
    type: String,
    enum: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'],
    default: 'LC'
  }
}, {
  timestamps: true
});

// Text index for search
speciesSchema.index({ 
  commonName: 'text', 
  scientificName: 'text', 
  family: 'text' 
});

const Species = mongoose.model('Species', speciesSchema);

module.exports = Species;
