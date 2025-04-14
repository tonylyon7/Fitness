import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true  // Format: "HH:mm"
  },
  endTime: {
    type: String,
    required: true  // Format: "HH:mm"
  },
  type: {
    type: String,
    enum: ['one_on_one', 'group'],
    default: 'one_on_one'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  sessionGoals: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  meetingLink: {
    type: String,
    trim: true
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sessionSchema.index({ coach: 1, date: 1 });
sessionSchema.index({ user: 1, date: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ date: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
