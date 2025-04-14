import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'past_due'],
    default: 'active'
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date,
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal'],
      required: true
    },
    last4: String,
    expiryDate: String
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  usage: {
    coachSessionsRemaining: {
      type: Number,
      default: 0
    },
    premiumContentAccess: {
      type: Boolean,
      default: false
    },
    customWorkoutPlans: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ renewalDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
