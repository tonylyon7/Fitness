import Coach from '../models/coach.model.js';
import Session from '../models/session.model.js';
import { ValidationError } from '../utils/errors.js';

export const getCoaches = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      minRate,
      maxRate,
      sortBy = 'rating',
      order = 'desc'
    } = req.query;

    const query = { isAvailable: true };
    if (specialization) {
      query.specializations = specialization;
    }
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['rating.average'] = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'hourlyRate') {
      sortOptions.hourlyRate = order === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    const coaches = await Coach.find(query)
      .populate('user', 'name profilePicture')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Coach.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        coaches,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCoachById = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id)
      .populate('user', 'name profilePicture')
      .populate('reviews.user', 'name profilePicture');

    if (!coach) {
      throw new ValidationError('Coach not found');
    }

    res.json({
      status: 'success',
      data: { coach }
    });
  } catch (error) {
    next(error);
  }
};

export const bookSession = async (req, res, next) => {
  try {
    const {
      coachId,
      date,
      startTime,
      endTime,
      sessionGoals,
      type = 'one_on_one'
    } = req.body;

    // Find coach and validate availability
    const coach = await Coach.findById(coachId);
    if (!coach) {
      throw new ValidationError('Coach not found');
    }

    // Validate if the slot is available
    const sessionDate = new Date(date);
    const dayOfWeek = sessionDate.toLocaleLowerCase();
    
    const dayAvailability = coach.availability.find(a => a.day === dayOfWeek);
    if (!dayAvailability) {
      throw new ValidationError('Coach is not available on this day');
    }

    const isSlotAvailable = dayAvailability.slots.some(
      slot => slot.startTime <= startTime && slot.endTime >= endTime
    );

    if (!isSlotAvailable) {
      throw new ValidationError('Selected time slot is not available');
    }

    // Check for existing bookings
    const existingSession = await Session.findOne({
      coach: coachId,
      date: sessionDate,
      startTime,
      endTime,
      status: { $in: ['scheduled', 'completed'] }
    });

    if (existingSession) {
      throw new ValidationError('This time slot is already booked');
    }

    // Calculate session amount
    const sessionDuration = (
      parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]) -
      (parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]))
    ) / 60; // Convert to hours

    const amount = coach.hourlyRate * sessionDuration;

    // Create session
    const session = await Session.create({
      coach: coachId,
      user: req.user._id,
      date: sessionDate,
      startTime,
      endTime,
      type,
      sessionGoals,
      amount
    });

    await session.populate('coach', 'user hourlyRate');
    await session.populate('user', 'name');

    res.status(201).json({
      status: 'success',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const sessions = await Session.find(query)
      .populate('coach', 'user hourlyRate')
      .populate('user', 'name profilePicture')
      .sort({ date: 1, startTime: 1 });

    res.json({
      status: 'success',
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
};
