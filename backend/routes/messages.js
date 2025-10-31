const express = require('express');
const Message = require('../models/Message');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/:communityId
// @desc    Get messages for a specific community
// @access  Private (must be member of community)
router.get('/:communityId', protect, async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Check if user is member of community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const isMember = community.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You must be a member to view messages' });
    }
    
    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Message.find({ community: communityId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments({ community: communityId });
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first (like WhatsApp)
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasMore: skip + messages.length < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/:communityId
// @desc    Send a message to a community
// @access  Private (must be member of community)
router.post('/:communityId', protect, async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { content, messageType = 'text', attachments = [] } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    // Check if user is member of community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const isMember = community.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You must be a member to send messages' });
    }
    
    // Create new message
    const newMessage = await Message.create({
      sender: req.user.id,
      community: communityId,
      content: content.trim(),
      messageType,
      attachments,
    });
    
    // Populate sender info for response
    await newMessage.populate('sender', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: newMessage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (only sender or admin can delete)
// @access  Private
router.delete('/:messageId', protect, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Check if user is sender or admin of community
    const community = await Community.findById(message.community);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const userMember = community.members.find(member => member.user.toString() === req.user.id);
    const isSender = message.sender.toString() === req.user.id;
    const isAdmin = userMember && userMember.role === 'admin';
    
    if (!isSender && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
