const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const PointsService = require('../services/pointsService');

// Get all available achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ category: 1, points: -1 });

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
});

// Get user's achievements
router.get('/my', auth, async (req, res) => {
  try {
    const userAchievements = await UserAchievement.find({ user: req.user.id })
      .populate('achievement')
      .sort({ earnedAt: -1 });

    res.json({
      success: true,
      data: { achievements: userAchievements }
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements'
    });
  }
});

// Get user's achievement progress summary
router.get('/progress', auth, async (req, res) => {
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

// Get achievement statistics
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

    const stats = user.learningStats;
    const totalAchievements = await Achievement.countDocuments();
    const earnedAchievements = await UserAchievement.countDocuments({ user: req.user.id });

    const achievementStats = {
      totalAchievements,
      earnedAchievements,
      completionRate: totalAchievements > 0 ? (earnedAchievements / totalAchievements * 100).toFixed(1) : 0,
      totalPoints: stats.totalPoints,
      lessonsCompleted: stats.lessonsCompleted,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      perfectScores: stats.perfectScores,
      categoriesMastered: Object.values(stats.categoryProgress).filter(count => count >= 5).length
    };

    res.json({
      success: true,
      data: { stats: achievementStats }
    });
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement stats'
    });
  }
});

// Mark achievement as viewed
router.put('/:achievementId/view', auth, async (req, res) => {
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

// Get achievements by category
router.get('/category/:category', async (req, res) => {
  try {
    const achievements = await Achievement.find({ 
      category: req.params.category 
    }).sort({ points: -1 });

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    console.error('Error fetching achievements by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements by category'
    });
  }
});

// Get achievements by rarity
router.get('/rarity/:rarity', async (req, res) => {
  try {
    const achievements = await Achievement.find({ 
      rarity: req.params.rarity 
    }).sort({ points: -1 });

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    console.error('Error fetching achievements by rarity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements by rarity'
    });
  }
});

// Get recent achievements (for notifications)
router.get('/recent', auth, async (req, res) => {
  try {
    const recentAchievements = await UserAchievement.find({ 
      user: req.user.id,
      isNew: true 
    })
    .populate('achievement')
    .sort({ earnedAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: { achievements: recentAchievements }
    });
  } catch (error) {
    console.error('Error fetching recent achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent achievements'
    });
  }
});

module.exports = router;
