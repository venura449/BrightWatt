const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  pointsEarned: {
    type: Number,
    required: true
  },
  isNew: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ user: 1, earnedAt: -1 });
userAchievementSchema.index({ user: 1, isNew: 1 });

// Method to mark as viewed
userAchievementSchema.methods.markAsViewed = function() {
  this.isNew = false;
  return this.save();
};

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = UserAchievement;

