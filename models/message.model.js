import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    mimeType: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
