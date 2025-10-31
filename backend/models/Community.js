const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member',
    },
  }],
  membersCount: {
    type: Number,
    default: 1,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  maxMembers: {
    type: Number,
    default: 1000,
  },
}, { timestamps: true });

// Index for searching communities by name
communitySchema.index({ name: 'text' });

// Add creator as first member
communitySchema.pre('save', function(next) {
  if (this.isNew && this.createdBy && this.members.length === 0) {
    this.members.push({
      user: this.createdBy,
      role: 'admin',
      joinedAt: new Date(),
    });
    this.membersCount = this.members.length;
  }
  next();
});

module.exports = mongoose.model('Community', communitySchema);


