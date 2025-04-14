import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['basic', 'premium', 'elite'],
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    limit: Number
  }],
  pricing: {
    monthly: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    yearly: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      },
      savings: {
        type: Number,
        required: true
      }
    }
  },
  benefits: [{
    type: String,
    required: true
  }],
  coachSessions: {
    included: {
      type: Boolean,
      default: false
    },
    monthlyLimit: {
      type: Number,
      default: 0
    }
  },
  premiumContent: {
    included: {
      type: Boolean,
      default: false
    },
    categories: [{
      type: String
    }]
  },
  customWorkoutPlans: {
    included: {
      type: Boolean,
      default: false
    },
    monthlyLimit: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan;
