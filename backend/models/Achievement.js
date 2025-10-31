const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['learning', 'streak', 'mastery', 'social', 'special'],
    default: 'learning'
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  requirements: {
    type: {
      type: String,
      enum: ['lessons_completed', 'streak_days', 'perfect_scores', 'categories_mastered', 'total_points'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['Solar Panels', 'Home Installation', 'Battery Storage', 'Cost Analysis', 'Maintenance', 'Troubleshooting', 'all'],
      default: 'all'
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ 'requirements.type': 1 });

// Method to check if user qualifies for this achievement
achievementSchema.methods.checkEligibility = function(userStats) {
  const { type, value, category } = this.requirements;
  
  switch (type) {
    case 'lessons_completed':
      return userStats.lessonsCompleted >= value;
    case 'streak_days':
      return userStats.currentStreak >= value;
    case 'perfect_scores':
      return userStats.perfectScores >= value;
    case 'categories_mastered':
      if (category === 'all') {
        return userStats.categoriesMastered >= value;
      } else {
        return userStats.categoryProgress[category] >= value;
      }
    case 'total_points':
      return userStats.totalPoints >= value;
    default:
      return false;
  }
};

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;

