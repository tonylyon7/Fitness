export const defaultSubscriptionPlans = [
  {
    name: 'basic',
    displayName: 'Basic Plan',
    description: 'Perfect for getting started with your fitness journey',
    features: [
      {
        name: 'workout_tracking',
        description: 'Track your daily workouts',
        limit: null
      },
      {
        name: 'social_features',
        description: 'Connect with fitness community',
        limit: null
      }
    ],
    pricing: {
      monthly: {
        amount: 9.99,
        currency: 'USD'
      },
      yearly: {
        amount: 99.99,
        currency: 'USD',
        savings: 20
      }
    },
    benefits: [
      'Basic workout tracking',
      'Community access',
      'Progress tracking',
      'Basic analytics'
    ],
    coachSessions: {
      included: false,
      monthlyLimit: 0
    },
    premiumContent: {
      included: false,
      categories: []
    },
    customWorkoutPlans: {
      included: false,
      monthlyLimit: 0
    }
  },
  {
    name: 'premium',
    displayName: 'Premium Plan',
    description: 'Enhanced features for serious fitness enthusiasts',
    features: [
      {
        name: 'workout_tracking',
        description: 'Advanced workout tracking with analytics',
        limit: null
      },
      {
        name: 'social_features',
        description: 'Enhanced social features',
        limit: null
      },
      {
        name: 'coach_sessions',
        description: 'Monthly coaching sessions',
        limit: 2
      },
      {
        name: 'premium_content',
        description: 'Access to premium workout content',
        limit: null
      }
    ],
    pricing: {
      monthly: {
        amount: 19.99,
        currency: 'USD'
      },
      yearly: {
        amount: 199.99,
        currency: 'USD',
        savings: 25
      }
    },
    benefits: [
      'All Basic features',
      '2 monthly coaching sessions',
      'Premium workout content',
      'Advanced analytics',
      'Nutrition tracking',
      'Custom workout recommendations'
    ],
    coachSessions: {
      included: true,
      monthlyLimit: 2
    },
    premiumContent: {
      included: true,
      categories: ['workouts', 'nutrition']
    },
    customWorkoutPlans: {
      included: true,
      monthlyLimit: 2
    }
  },
  {
    name: 'elite',
    displayName: 'Elite Plan',
    description: 'Ultimate fitness experience with personalized coaching',
    features: [
      {
        name: 'workout_tracking',
        description: 'Premium workout tracking with detailed analytics',
        limit: null
      },
      {
        name: 'social_features',
        description: 'Premium social features',
        limit: null
      },
      {
        name: 'coach_sessions',
        description: 'Unlimited coaching sessions',
        limit: null
      },
      {
        name: 'premium_content',
        description: 'Full access to all premium content',
        limit: null
      },
      {
        name: 'custom_plans',
        description: 'Unlimited custom workout plans',
        limit: null
      }
    ],
    pricing: {
      monthly: {
        amount: 39.99,
        currency: 'USD'
      },
      yearly: {
        amount: 399.99,
        currency: 'USD',
        savings: 30
      }
    },
    benefits: [
      'All Premium features',
      'Unlimited coaching sessions',
      'Priority support',
      'Personalized meal plans',
      'Advanced performance metrics',
      'Exclusive content access',
      'Custom workout programs'
    ],
    coachSessions: {
      included: true,
      monthlyLimit: -1 // Unlimited
    },
    premiumContent: {
      included: true,
      categories: ['workouts', 'nutrition', 'wellness', 'exclusive']
    },
    customWorkoutPlans: {
      included: true,
      monthlyLimit: -1 // Unlimited
    }
  }
];
