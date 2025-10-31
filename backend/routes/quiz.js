const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const QuizQuestion = require('../models/QuizQuestion');
const Quiz = require('../models/Quiz');
const PointsService = require('../services/pointsService');

// Get a random quiz with 10 questions
router.get('/random', auth, async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    // Build query filter
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    // Get 10 random questions
    const questions = await QuizQuestion.aggregate([
      { $match: filter },
      { $sample: { size: 10 } },
      { $project: { 
        _id: 1, 
        question: 1, 
        category: 1, 
        difficulty: 1, 
        points: 1 
      }}
    ]);
    
    if (questions.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Not enough questions available for the selected criteria'
      });
    }
    
    res.json({
      success: true,
      data: {
        quizId: new Date().getTime().toString(), // Simple quiz ID
        questions: questions.map((q, index) => ({
          id: q._id,
          questionNumber: index + 1,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          points: q.points
        })),
        totalQuestions: questions.length,
        totalPossiblePoints: questions.reduce((sum, q) => sum + q.points, 0)
      }
    });
    
  } catch (error) {
    console.error('Error generating random quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz'
    });
  }
});

// Submit quiz answers and get results
router.post('/submit', auth, async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    const userId = req.user.id;
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Quiz answers are required'
      });
    }
    
    // Get the questions and their correct answers
    const questionIds = answers.map(a => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });
    
    if (questions.length !== answers.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question data'
      });
    }
    
    // Calculate results
    let totalScore = 0;
    let totalPoints = 0;
    const quizQuestions = [];
    
    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (!question) continue;
      
      const isCorrect = answer.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      const pointsEarned = isCorrect ? question.points : 0;
      
      totalScore += isCorrect ? 1 : 0;
      totalPoints += pointsEarned;
      
      quizQuestions.push({
        question: question._id,
        userAnswer: answer.userAnswer,
        isCorrect,
        pointsEarned
      });
    }
    
    // Calculate percentage score
    const percentageScore = (totalScore / answers.length) * 100;
    
    // Determine category (use most common category from questions)
    const categoryCounts = {};
    questions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    const category = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b
    );
    
    // Determine difficulty (use most common difficulty)
    const difficultyCounts = {};
    questions.forEach(q => {
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
    });
    const difficulty = Object.keys(difficultyCounts).reduce((a, b) => 
      difficultyCounts[a] > difficultyCounts[b] ? a : b
    );
    
    // Save quiz attempt
    const quizAttempt = new Quiz({
      user: userId,
      questions: quizQuestions,
      totalScore: totalScore,
      totalPoints: totalPoints,
      category,
      difficulty,
      timeSpent: timeSpent || 0
    });
    
    await quizAttempt.save();
    
    // Award points to user using PointsService
    if (totalPoints > 0) {
      try {
        // Create a special achievement for quiz completion
        await PointsService.awardQuizPoints(userId, totalPoints, category);
      } catch (error) {
        console.error('Error awarding quiz points:', error);
        // Don't fail the quiz submission if points awarding fails
      }
    }
    
    // Get detailed results with explanations
    const detailedResults = answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      return {
        questionId: answer.questionId,
        question: question.question,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: answer.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase(),
        explanation: question.explanation,
        points: question.points,
        pointsEarned: answer.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase() ? question.points : 0
      };
    });
    
    res.json({
      success: true,
      data: {
        quizId,
        totalScore,
        totalQuestions: answers.length,
        percentageScore: Math.round(percentageScore * 100) / 100,
        totalPoints,
        category,
        difficulty,
        timeSpent,
        results: detailedResults,
        performance: {
          excellent: percentageScore >= 90,
          good: percentageScore >= 80 && percentageScore < 90,
          satisfactory: percentageScore >= 70 && percentageScore < 80,
          needsImprovement: percentageScore < 70
        }
      }
    });
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
});

// Get user's quiz history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, category, difficulty } = req.query;
    
    const filter = { user: req.user.id };
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    
    const quizzes = await Quiz.find(filter)
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .populate('questions.question', 'question category difficulty points');
    
    const history = quizzes.map(quiz => ({
      id: quiz._id,
      completedAt: quiz.completedAt,
      totalScore: quiz.totalScore,
      totalQuestions: quiz.questions.length,
      percentageScore: Math.round((quiz.totalScore / quiz.questions.length) * 100 * 100) / 100,
      totalPoints: quiz.totalPoints,
      category: quiz.category,
      difficulty: quiz.difficulty,
      timeSpent: quiz.timeSpent
    }));
    
    res.json({
      success: true,
      data: { history }
    });
    
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz history'
    });
  }
});

// Get quiz statistics for user
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic stats
    const totalQuizzes = await Quiz.countDocuments({ user: userId });
    const totalQuestions = await Quiz.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: { $size: '$questions' } } } }
    ]);
    
    const totalPoints = await Quiz.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);
    
    // Get category performance
    const categoryStats = await Quiz.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgScore: { $avg: { $divide: ['$totalScore', { $size: '$questions' }] } },
        totalPoints: { $sum: '$totalPoints' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get difficulty performance
    const difficultyStats = await Quiz.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
        avgScore: { $avg: { $divide: ['$totalScore', { $size: '$questions' }] } },
        totalPoints: { $sum: '$totalPoints' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get recent performance trend
    const recentQuizzes = await Quiz.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('percentageScore completedAt');
    
    const stats = {
      totalQuizzes,
      totalQuestions: totalQuestions[0]?.total || 0,
      totalPoints: totalPoints[0]?.total || 0,
      averageScore: totalQuizzes > 0 ? 
        Math.round((totalPoints[0]?.total || 0) / totalQuizzes * 100) / 100 : 0,
      categoryStats,
      difficultyStats,
      recentPerformance: recentQuizzes.map(q => ({
        score: Math.round((q.totalScore / q.questions.length) * 100 * 100) / 100,
        date: q.completedAt
      }))
    };
    
    res.json({
      success: true,
      data: { stats }
    });
    
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics'
    });
  }
});

// Get available quiz categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await QuizQuestion.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$category',
        questionCount: { $sum: 1 },
        avgPoints: { $avg: '$points' }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: { categories }
    });
    
  } catch (error) {
    console.error('Error fetching quiz categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz categories'
    });
  }
});

module.exports = router;
