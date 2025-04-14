import Subscription from '../models/subscription.model.js';
import SubscriptionPlan from '../models/subscription-plan.model.js';
import { ValidationError } from '../utils/errors.js';

export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    
    if (!subscription) {
      return res.json({
        status: 'success',
        data: {
          hasSubscription: false,
          subscription: null
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        hasSubscription: true,
        subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { plan, interval, paymentMethod } = req.body;

    // Validate plan exists and is active
    const subscriptionPlan = await SubscriptionPlan.findOne({
      name: plan,
      isActive: true
    });

    if (!subscriptionPlan) {
      throw new ValidationError('Invalid subscription plan');
    }

    // Calculate dates
    const startDate = new Date();
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + (interval === 'yearly' ? 12 : 1));
    
    const endDate = new Date(renewalDate);
    endDate.setDate(endDate.getDate() - 1);

    // Get plan price
    const price = {
      amount: subscriptionPlan.pricing[interval].amount,
      currency: subscriptionPlan.pricing[interval].currency,
      interval
    };

    // Set initial usage limits based on plan
    const usage = {
      coachSessionsRemaining: subscriptionPlan.coachSessions.monthlyLimit,
      premiumContentAccess: subscriptionPlan.premiumContent.included,
      customWorkoutPlans: subscriptionPlan.customWorkoutPlans.monthlyLimit
    };

    // Create or update subscription
    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        plan,
        status: 'active',
        features: subscriptionPlan.features.map(f => ({
          name: f.name,
          enabled: true
        })),
        startDate,
        endDate,
        renewalDate,
        price,
        paymentMethod,
        autoRenew: true,
        usage
      },
      { 
        new: true,
        upsert: true
      }
    );

    res.json({
      status: 'success',
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) {
      throw new ValidationError('No active subscription found');
    }

    if (subscription.status === 'canceled') {
      throw new ValidationError('Subscription is already canceled');
    }

    // Update subscription
    subscription.status = 'canceled';
    subscription.autoRenew = false;
    subscription.cancellationReason = reason;
    await subscription.save();

    res.json({
      status: 'success',
      message: 'Subscription successfully canceled',
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });

    res.json({
      status: 'success',
      data: { plans }
    });
  } catch (error) {
    next(error);
  }
};

export const checkFeatureAccess = async (req, res, next) => {
  try {
    const { feature } = req.params;
    
    const subscription = await Subscription.findOne({ 
      user: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.json({
        status: 'success',
        data: {
          hasAccess: false,
          reason: 'No active subscription'
        }
      });
    }

    const featureConfig = subscription.features.find(f => f.name === feature);
    const hasAccess = featureConfig && featureConfig.enabled;

    res.json({
      status: 'success',
      data: {
        hasAccess,
        subscription: {
          plan: subscription.plan,
          endDate: subscription.endDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
