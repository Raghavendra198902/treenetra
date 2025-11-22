const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  inspectionDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['healthy', 'diseased', 'pest_infestation', 'dead'],
    required: true
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  diseases: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  pests: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  treatment: {
    prescribed: String,
    applied: String,
    applicationDate: Date,
    nextTreatmentDate: Date
  },
  measurements: {
    height: Number,
    diameter: Number,
    canopySpread: Number,
    leafDensity: {
      type: String,
      enum: ['sparse', 'moderate', 'dense']
    }
  },
  environmentalFactors: {
    temperature: Number,
    humidity: Number,
    soilMoisture: {
      type: String,
      enum: ['dry', 'moist', 'wet']
    },
    weather_conditions: String
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendations: {
    type: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
healthRecordSchema.index({ treeId: 1, inspectionDate: -1 });
healthRecordSchema.index({ status: 1 });
healthRecordSchema.index({ inspectedBy: 1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

module.exports = HealthRecord;
