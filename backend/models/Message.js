const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  attachments: [{
    type: String, // URL or file path
    description: String,
  }],
}, {
  timestamps: true,
});

// Index for efficient querying
messageSchema.index({ community: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
