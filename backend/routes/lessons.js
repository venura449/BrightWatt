const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const { protect } = require('../middleware/auth');

// Get all lessons (public)
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    
    const lessons = await Lesson.find(query)
      .sort('order')
      .skip(skip)
      .limit(parseInt(limit))
      .select('-quiz -resources');
    
    const total = await Lesson.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons'
    });
  }
});

// Get lessons by category (MUST come before /:id route)
router.get('/category/:category', async (req, res) => {
  try {
    const lessons = await Lesson.find({ 
      category: req.params.category, 
      isActive: true 
    }).sort('order');
    
    res.json({
      success: true,
      data: { lessons }
    });
  } catch (error) {
    console.error('Error fetching lessons by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons by category'
    });
  }
});

// Search lessons (MUST come before /:id route)
router.get('/search/:query', async (req, res) => {
  try {
    const lessons = await Lesson.find({
      $text: { $search: req.params.query },
      isActive: true
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json({
      success: true,
      data: { lessons }
    });
  } catch (error) {
    console.error('Error searching lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search lessons'
    });
  }
});

// Get lesson by ID (public) - MUST come after specific routes
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('prerequisites', 'title description difficulty')
      .select('-quiz');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    res.json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson'
    });
  }
});

// Get lesson with full content (authenticated users only)
router.get('/:id/full', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('prerequisites', 'title description difficulty')
      .populate('resources');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    res.json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    console.error('Error fetching full lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch full lesson'
    });
  }
});

// Get lesson quiz (authenticated users only)
router.get('/:id/quiz', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).select('quiz');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    if (!lesson.quiz || lesson.quiz.questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quiz available for this lesson'
      });
    }
    
    res.json({
      success: true,
      data: { quiz: lesson.quiz }
    });
  } catch (error) {
    console.error('Error fetching lesson quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson quiz'
    });
  }
});

// Create new lesson (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    
    res.status(201).json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update lesson (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    res.json({
      success: true,
      data: { lesson }
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete lesson (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson'
    });
  }
});

module.exports = router;
