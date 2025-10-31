const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const PointsService = require('../services/pointsService');

// Get user's lesson progress
router.get('/lessons', auth, async (req, res) => {
  try {
    const progress = await UserProgress.find({ user: req.user.id })
      .populate('lesson', 'title category difficulty duration')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson progress'
    });
  }
});

// Get specific lesson progress
router.get('/lessons/:lessonId', auth, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user.id,
      lesson: req.params.lessonId
    }).populate('lesson', 'title category difficulty duration');

    if (!progress) {
      return res.json({
        success: true,
        data: { progress: null }
      });
    }

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson progress'
    });
  }
});

// Update lesson progress
router.put('/lessons/:lessonId', auth, async (req, res) => {
  try {
    const { progress, score } = req.body;
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    let userProgress = await UserProgress.findOne({
      user: userId,
      lesson: lessonId
    });

    if (!userProgress) {
      userProgress = new UserProgress({
        user: userId,
        lesson: lessonId,
        status: 'not_started',
        progress: 0
      });
    }

    // Update progress
    await userProgress.updateProgress(progress, score);

    res.json({
      success: true,
      data: { progress: userProgress }
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson progress'
    });
  }
});

// Complete a lesson and award points
router.post('/lessons/:lessonId/complete', auth, async (req, res) => {
  try {
    const { score = 100 } = req.body;
    const lessonId = req.params.lessonId;
    const userId = req.user.id;

    // Use PointsService to complete lesson and award points
    const result = await PointsService.completeLesson(userId, lessonId, score);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson'
    });
  }
});

// Get user's achievement progress
router.get('/achievements', auth, async (req, res) => {
  try {
    const progress = await PointsService.getUserAchievementProgress(req.user.id);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching achievement progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement progress'
    });
  }
});

// Mark achievement as viewed
router.put('/achievements/:achievementId/view', auth, async (req, res) => {
  try {
    const result = await PointsService.markAchievementAsViewed(
      req.user.id,
      req.params.achievementId
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error marking achievement as viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark achievement as viewed'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await PointsService.getLeaderboard(limit);

    res.json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

// Get user's learning statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id)
      .select('learningStats');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { stats: user.learningStats }
    });
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning stats'
    });
  }
});

// Get user's streak information
router.get('/streak', auth, async (req, res) => {
  try {
    const streak = await PointsService.calculateLearningStreak(req.user.id);

    res.json({
      success: true,
      data: { streak }
    });
  } catch (error) {
    console.error('Error calculating streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate streak'
    });
  }
});

module.exports = router;
