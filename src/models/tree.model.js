const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  treeId: {
    type: String,
    unique: true,
    required: true
  },
  speciesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Species',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  plantedDate: {
    type: Date
  },
  height: {
    type: Number,
    min: 0
  },
  diameter: {
    type: Number,
    min: 0
  },
  circumference: {
    type: Number,
    min: 0
  },
  canopySpread: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['healthy', 'diseased', 'dead', 'removed'],
    default: 'healthy'
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastInspectionDate: {
    type: Date
  },
  nextInspectionDate: {
    type: Date
  },
  metadata: {
    soil_type: String,
    sunlight_exposure: {
      type: String,
      enum: ['full_sun', 'partial_shade', 'full_shade']
    },
    water_source: String,
    surrounding_environment: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age
treeSchema.virtual('age').get(function() {
  if (!this.plantedDate) return null;
  const now = new Date();
  const years = now.getFullYear() - this.plantedDate.getFullYear();
  return years;
});

// Pre-save middleware to generate treeId
treeSchema.pre('save', async function(next) {
  if (!this.treeId) {
    const count = await mongoose.model('Tree').countDocuments();
    this.treeId = `TREE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
treeSchema.index({ 'location.coordinates': '2dsphere' });
treeSchema.index({ speciesId: 1 });
treeSchema.index({ status: 1 });
treeSchema.index({ createdBy: 1 });
treeSchema.index({ treeId: 1 });

const Tree = mongoose.model('Tree', treeSchema);

module.exports = Tree;
