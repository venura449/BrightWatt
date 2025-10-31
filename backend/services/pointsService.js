const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const UserAchievement = require('../models/UserAchievement');
const Achievement = require('../models/Achievement');

class PointsService {
  /**
   * Award points and check achievements when a lesson is completed
   */
  static async completeLesson(userId, lessonId, score = 100) {
    try {
      // Get user and lesson data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if lesson was already completed
      const existingProgress = await UserProgress.findOne({
        user: userId,
        lesson: lessonId,
        status: 'completed'
      });

      if (existingProgress) {
        return { message: 'Lesson already completed', pointsAwarded: 0 };
      }

      // Calculate base points for lesson completion
      const basePoints = this.calculateLessonPoints(score);
      
      // Update user progress
      await UserProgress.findOneAndUpdate(
        { user: userId, lesson: lessonId },
        {
          status: 'completed',
          progress: 100,
          score: score,
          completedAt: new Date(),
          lastAccessed: new Date()
        },
        { upsert: true, new: true }
      );

      // Update user learning stats
      const updatedUser = await this.updateUserStats(userId, basePoints, lessonId);
      
      // Check and award achievements
      const achievements = await this.checkAndAwardAchievements(userId, updatedUser);
      
      // Calculate total points earned from achievements
      const achievementPoints = achievements.reduce((total, achievement) => {
        return total + (achievement.pointsEarned || 0);
      }, 0);

      const totalPointsEarned = basePoints + achievementPoints;

      return {
        message: 'Lesson completed successfully',
        pointsAwarded: totalPointsEarned,
        basePoints: basePoints,
        achievementPoints: achievementPoints,
        achievements: achievements,
        userStats: updatedUser.learningStats
      };

    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  }

  /**
   * Calculate base points for lesson completion based on score
   */
  static calculateLessonPoints(score) {
    if (score >= 90) return 20;      // Excellent
    if (score >= 80) return 15;      // Good
    if (score >= 70) return 10;      // Satisfactory
    if (score >= 60) return 5;       // Passing
    return 1;                         // Minimum
  }

  /**
   * Update user learning statistics
   */
  static async updateUserStats(userId, pointsEarned, lessonId) {
    try {
      // Get lesson details to update category progress
      const lesson = await require('../models/Lesson').findById(lessonId);
      
      // Calculate new streak
      const newStreak = await this.calculateLearningStreak(userId);
      
      // Update user stats
      const updateData = {
        'learningStats.totalPoints': { $inc: pointsEarned },
        'learningStats.lessonsCompleted': { $inc: 1 },
        'learningStats.currentStreak': newStreak.current,
        'learningStats.longestStreak': { $max: newStreak.current },
        'learningStats.lastLessonDate': new Date()
      };

      // Update category progress if lesson has a category
      if (lesson && lesson.category) {
        const categoryKey = `learningStats.categoryProgress.${lesson.category}`;
        updateData[categoryKey] = { $inc: 1 };
      }

      // Update perfect scores if applicable
      if (pointsEarned >= 20) { // 90% or higher
        updateData['learningStats.perfectScores'] = { $inc: 1 };
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );

      return updatedUser;

    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * Calculate learning streak based on daily lesson completion
   */
  static async calculateLearningStreak(userId) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Get all completed lessons for this user
      const completedLessons = await UserProgress.find({
        user: userId,
        status: 'completed'
      }).sort({ completedAt: -1 });

      if (completedLessons.length === 0) {
        return { current: 0, longest: 0 };
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let currentDate = startOfDay;

      // Check if user completed a lesson today
      const todayLesson = completedLessons.find(lesson => {
        const lessonDate = new Date(lesson.completedAt);
        return lessonDate >= startOfDay;
      });

      if (todayLesson) {
        currentStreak = 1;
        tempStreak = 1;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000); // Go back one day
      }

      // Check consecutive days
      for (let i = 0; i < 365; i++) { // Check up to 1 year back
        const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        const hasLessonThisDay = completedLessons.some(lesson => {
          const lessonDate = new Date(lesson.completedAt);
          return lessonDate >= dayStart && lessonDate <= dayEnd;
        });

        if (hasLessonThisDay) {
          tempStreak++;
          currentStreak = Math.max(currentStreak, tempStreak);
        } else {
          tempStreak = 0;
        }

        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      }

      longestStreak = Math.max(currentStreak, tempStreak);

      return { current: currentStreak, longest: longestStreak };

    } catch (error) {
      console.error('Error calculating learning streak:', error);
      return { current: 0, longest: 0 };
    }
  }

  /**
   * Check and award achievements based on current user stats
   */
  static async checkAndAwardAchievements(userId, user) {
    try {
      const achievements = [];
      const allAchievements = await Achievement.find();

      for (const achievement of allAchievements) {
        // Check if user already has this achievement
        const existingUserAchievement = await UserAchievement.findOne({
          user: userId,
          achievement: achievement._id
        });

        if (existingUserAchievement) {
          continue; // Skip if already earned
        }

        // Check if achievement requirements are met
        if (await this.checkAchievementRequirements(user, achievement)) {
          // Award the achievement
          const userAchievement = new UserAchievement({
            user: userId,
            achievement: achievement._id,
            pointsEarned: achievement.points,
            isNew: true
          });

          await userAchievement.save();
          achievements.push({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            pointsEarned: achievement.points,
            category: achievement.category,
            rarity: achievement.rarity
          });

          // Update user's total points with achievement points
          await User.findByIdAndUpdate(
            userId,
            { $inc: { 'learningStats.totalPoints': achievement.points } }
          );
        }
      }

      return achievements;

    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Check if a specific achievement's requirements are met
   */
  static async checkAchievementRequirements(user, achievement) {
    try {
      const requirements = achievement.requirements;
      const stats = user.learningStats;

      switch (requirements.type) {
        case 'lessons_completed':
          return stats.lessonsCompleted >= requirements.value;

        case 'streak_days':
          return stats.currentStreak >= requirements.value;

        case 'total_points':
          return stats.totalPoints >= requirements.value;

        case 'categories_mastered':
          // Check if user has completed required number of lessons in specific category
          if (requirements.category && requirements.category !== 'all') {
            const categoryProgress = stats.categoryProgress[requirements.category] || 0;
            return categoryProgress >= requirements.value;
          }
          // Check total categories mastered
          const masteredCategories = Object.values(stats.categoryProgress).filter(count => count >= 5).length;
          return masteredCategories >= requirements.value;

        case 'perfect_scores':
          return stats.perfectScores >= requirements.value;

        default:
          return false;
      }

    } catch (error) {
      console.error('Error checking achievement requirements:', error);
      return false;
    }
  }

  /**
   * Get user's achievement progress summary
   */
  static async getUserAchievementProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allAchievements = await Achievement.find();
      const userAchievements = await UserAchievement.find({ user: userId });
      
      const progress = {
        totalAchievements: allAchievements.length,
        earnedAchievements: userAchievements.length,
        totalPoints: user.learningStats.totalPoints,
        achievements: [],
        progressByCategory: {}
      };

      // Group achievements by category
      for (const achievement of allAchievements) {
        const isEarned = userAchievements.some(ua => ua.achievement.equals(achievement._id));
        const userAchievement = userAchievements.find(ua => ua.achievement.equals(achievement._id));

        if (!progress.progressByCategory[achievement.category]) {
          progress.progressByCategory[achievement.category] = {
            total: 0,
            earned: 0,
            points: 0
          };
        }

        progress.progressByCategory[achievement.category].total++;
        if (isEarned) {
          progress.progressByCategory[achievement.category].earned++;
          progress.progressByCategory[achievement.category].points += achievement.points;
        }

        progress.achievements.push({
          id: achievement._id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          rarity: achievement.rarity,
          points: achievement.points,
          isEarned,
          earnedAt: userAchievement?.earnedAt || null,
          isNew: userAchievement?.isNew || false
        });
      }

      return progress;

    } catch (error) {
      console.error('Error getting user achievement progress:', error);
      throw error;
    }
  }

  /**
   * Mark achievement as viewed (no longer new)
   */
  static async markAchievementAsViewed(userId, achievementId) {
    try {
      await UserAchievement.findOneAndUpdate(
        { user: userId, achievement: achievementId },
        { isNew: false }
      );
      return { success: true };
    } catch (error) {
      console.error('Error marking achievement as viewed:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard of top users by points
   */
  static async getLeaderboard(limit = 10) {
    try {
      const topUsers = await User.find({}, 'firstName lastName learningStats.totalPoints learningStats.lessonsCompleted')
        .sort({ 'learningStats.totalPoints': -1 })
        .limit(limit);

      return topUsers.map((user, index) => ({
        rank: index + 1,
        name: `${user.firstName} ${user.lastName}`,
        points: user.learningStats.totalPoints,
        lessonsCompleted: user.learningStats.lessonsCompleted
      }));

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Award points for quiz completion
   */
  static async awardQuizPoints(userId, pointsEarned, category) {
    try {
      // Update user's total points
      await User.findByIdAndUpdate(
        userId,
        { 
          $inc: { 'learningStats.totalPoints': pointsEarned },
          $set: { 'learningStats.lastQuizDate': new Date() }
        }
      );

      // Check for quiz-related achievements
      const user = await User.findById(userId);
      const achievements = await this.checkAndAwardAchievements(userId, user);

      return {
        pointsAwarded: pointsEarned,
        achievements: achievements
      };

    } catch (error) {
      console.error('Error awarding quiz points:', error);
      throw error;
    }
  }
}

module.exports = PointsService;
