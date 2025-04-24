import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: false, // Make content optional to allow image-only posts
    default: '',
    trim: true
  },
  media: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  type: {
    type: String,
    enum: ['workout', 'progress', 'general'],
    default: 'general'
  },
  workoutDetails: {
    exercises: [{
      name: String,
      sets: Number,
      reps: Number,
      weight: Number
    }],
    duration: Number, // in minutes
    caloriesBurned: Number
  }
}, {
  timestamps: true
});

// Index for better feed query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
