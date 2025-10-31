const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizQuestion',
      required: true
    },
    userAnswer: {
      type: String,
      enum: ['yes', 'no'],
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalScore: {
    type: Number,
    required: true,
    min: 0
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in seconds
    min: 0
  }
}, {
  timestamps: true
});

// Index for user quiz history and analytics
quizAttemptSchema.index({ user: 1, completedAt: -1 });
quizAttemptSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Quiz', quizAttemptSchema);

