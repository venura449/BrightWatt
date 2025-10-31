const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  quizResults: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
userProgressSchema.index({ user: 1, status: 1 });
userProgressSchema.index({ user: 1, completedAt: -1 });

// Method to update progress
userProgressSchema.methods.updateProgress = function(progress, score = null) {
  this.progress = Math.min(100, Math.max(0, progress));
  this.lastAccessed = new Date();
  
  if (progress >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
    if (score !== null) {
      this.score = score;
    }
  } else if (progress > 0) {
    this.status = 'in_progress';
  }
  
  return this.save();
};

// Method to add quiz attempt
userProgressSchema.methods.addQuizAttempt = function(quizResults, score) {
  this.attempts += 1;
  this.quizResults = quizResults;
  this.score = Math.max(this.score, score);
  
  if (score >= 80) { // Consider 80% as completion threshold
    this.progress = 100;
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress;
