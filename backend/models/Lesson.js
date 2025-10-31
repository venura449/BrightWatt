const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    default: '0 min'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    required: true,
    enum: ['Solar Panels', 'Home Installation', 'Battery Storage', 'Cost Analysis', 'Maintenance', 'Troubleshooting']
  },
  thumbnail: {
    type: String,
    default: '🌞'
  },
  youtubeUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/.test(v);
      },
      message: 'Please provide a valid YouTube URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['PDF', 'Link', 'Document']
    }
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }]
  }
}, {
  timestamps: true
});

// Index for better search performance
lessonSchema.index({ title: 'text', description: 'text', category: 1, difficulty: 1 });

// Virtual for lesson completion status (will be populated from user progress)
lessonSchema.virtual('isCompleted').get(function() {
  return false; // This will be populated when querying with user context
});

// Virtual for lesson progress (will be populated from user progress)
lessonSchema.virtual('progress').get(function() {
  return 0; // This will be populated when querying with user context
});

// Method to get lessons by category
lessonSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort('order');
};

// Method to get lessons by difficulty
lessonSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty, isActive: true }).sort('order');
};

// Method to search lessons
lessonSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

// Method to get lesson with prerequisites
lessonSchema.statics.getWithPrerequisites = function(lessonId) {
  return this.findById(lessonId)
    .populate('prerequisites', 'title description difficulty')
    .exec();
};

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
