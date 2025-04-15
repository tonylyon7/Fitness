import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { ValidationError } from '../utils/errors.js';
import { getIO } from '../services/socket.service.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name profilePicture')
      .sort({ 'lastMessage.timestamp': -1 });

    res.json({
      status: 'success',
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      throw new ValidationError('Conversation not found');
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    const updatedMessages = await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Update unread count in conversation
    await Conversation.updateOne(
      { _id: conversationId, 'unreadCounts.user': req.user._id },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    // Notify other participants that messages were read
    if (updatedMessages.modifiedCount > 0) {
      const io = getIO();
      conversation.participants.forEach(participantId => {
        if (participantId.toString() !== req.user._id.toString()) {
          io.to(`user_${participantId}`).emit('messages_read', {
            conversationId,
            userId: req.user._id,
            readAt: new Date()
          });
        }
      });
    }

    const total = await Message.countDocuments({ conversation: conversationId });

    res.json({
      status: 'success',
      data: {
        messages: messages.reverse(),
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

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, contentType = 'text', mediaUrl, replyToId } = req.body;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      throw new ValidationError('Conversation not found');
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      contentType,
      mediaUrl,
      replyTo: replyToId,
      readBy: [{ user: req.user._id }]
    });

    // Update conversation's last message and unread counts
    await Conversation.updateOne(
      { _id: conversationId },
      {
        lastMessage: {
          sender: req.user._id,
          content,
          timestamp: new Date()
        },
        $inc: {
          'unreadCounts.$[elem].count': 1
        }
      },
      {
        arrayFilters: [
          { 'elem.user': { $ne: req.user._id } }
        ]
      }
    );

    await message.populate('sender', 'name profilePicture');
    if (replyToId) {
      await message.populate('replyTo');
    }

    // Emit message to all participants in the conversation
    const io = getIO();
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        io.to(`user_${participantId}`).emit('new_message', {
          conversationId,
          message
        });
      }
    });

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { participantIds, type = 'direct', name } = req.body;

    // Ensure current user is included in participants
    const allParticipants = [...new Set([...participantIds, req.user._id])];

    // For direct messages, ensure exactly 2 participants
    if (type === 'direct' && allParticipants.length !== 2) {
      throw new ValidationError('Direct conversations must have exactly 2 participants');
    }

    // Check if direct conversation already exists
    if (type === 'direct') {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: allParticipants, $size: 2 }
      });

      if (existingConversation) {
        throw new ValidationError('Conversation already exists');
      }
    }

    // Create conversation
    const conversation = await Conversation.create({
      participants: allParticipants,
      type,
      name,
      unreadCounts: allParticipants.map(userId => ({
        user: userId,
        count: 0
      })),
      messages: []
    });

    await conversation.populate('participants', 'name profilePicture');

    // Notify all participants about the new conversation
    const io = getIO();
    allParticipants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('new_conversation', conversation);
    });

    res.status(201).json({
      status: 'success',
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};
