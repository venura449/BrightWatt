const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  correctAnswer: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['solar_panels', 'installation', 'battery_storage', 'cost_analysis', 'maintenance', 'troubleshooting', 'general']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for random selection and category filtering
quizQuestionSchema.index({ category: 1, isActive: 1, difficulty: 1 });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);

