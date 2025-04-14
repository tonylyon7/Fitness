import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group', 'support'],
    default: 'direct'
  },
  name: {
    type: String,
    trim: true
  },
  lastMessage: {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: Date
  },
  unreadCounts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  metadata: {
    isCoachSession: {
      type: Boolean,
      default: false
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    supportTicketId: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ type: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
