import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specializations: [{
    type: String,
    enum: [
      'weight_training',
      'cardio',
      'yoga',
      'nutrition',
      'crossfit',
      'powerlifting',
      'bodybuilding',
      'rehabilitation'
    ]
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuer: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String, // Format: "HH:mm"
      endTime: String    // Format: "HH:mm"
    }]
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  about: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
coachSchema.index({ 'rating.average': -1 });
coachSchema.index({ hourlyRate: 1 });
coachSchema.index({ specializations: 1 });
coachSchema.index({ isAvailable: 1 });

const Coach = mongoose.model('Coach', coachSchema);

export default Coach;
