const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
require('dotenv').config();

const achievements = [
  // Learning achievements
  {
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'learning',
    points: 10,
    requirements: {
      type: 'lessons_completed',
      value: 1,
      category: 'all'
    },
    rarity: 'common'
  },
  {
    name: 'Dedicated Learner',
    description: 'Complete 5 lessons',
    icon: '📚',
    category: 'learning',
    points: 25,
    requirements: {
      type: 'lessons_completed',
      value: 5,
      category: 'all'
    },
    rarity: 'common'
  },
  {
    name: 'Knowledge Seeker',
    description: 'Complete 10 lessons',
    icon: '🎓',
    category: 'learning',
    points: 50,
    requirements: {
      type: 'lessons_completed',
      value: 10,
      category: 'all'
    },
    rarity: 'rare'
  },
  {
    name: 'Solar Scholar',
    description: 'Complete 25 lessons',
    icon: '☀️',
    category: 'learning',
    points: 100,
    requirements: {
      type: 'lessons_completed',
      value: 25,
      category: 'all'
    },
    rarity: 'epic'
  },
  {
    name: 'Master of Solar',
    description: 'Complete 50 lessons',
    icon: '👑',
    category: 'learning',
    points: 200,
    requirements: {
      type: 'lessons_completed',
      value: 50,
      category: 'all'
    },
    rarity: 'legendary'
  },

  // Streak achievements
  {
    name: 'Consistent Learner',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    category: 'streak',
    points: 20,
    requirements: {
      type: 'streak_days',
      value: 3,
      category: 'all'
    },
    rarity: 'common'
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    category: 'streak',
    points: 50,
    requirements: {
      type: 'streak_days',
      value: 7,
      category: 'all'
    },
    rarity: 'rare'
  },
  {
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day learning streak',
    icon: '💪',
    category: 'streak',
    points: 100,
    requirements: {
      type: 'streak_days',
      value: 14,
      category: 'all'
    },
    rarity: 'epic'
  },
  {
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '🏆',
    category: 'streak',
    points: 250,
    requirements: {
      type: 'streak_days',
      value: 30,
      category: 'all'
    },
    rarity: 'legendary'
  },

  // Perfect score achievements
  {
    name: 'Perfect Score',
    description: 'Get a perfect score on a lesson',
    icon: '⭐',
    category: 'mastery',
    points: 15,
    requirements: {
      type: 'perfect_scores',
      value: 1,
      category: 'all'
    },
    rarity: 'common'
  },
  {
    name: 'Perfectionist',
    description: 'Get perfect scores on 5 lessons',
    icon: '🌟',
    category: 'mastery',
    points: 75,
    requirements: {
      type: 'perfect_scores',
      value: 5,
      category: 'all'
    },
    rarity: 'rare'
  },
  {
    name: 'Flawless Master',
    description: 'Get perfect scores on 10 lessons',
    icon: '💎',
    category: 'mastery',
    points: 150,
    requirements: {
      type: 'perfect_scores',
      value: 10,
      category: 'all'
    },
    rarity: 'epic'
  },

  // Category mastery achievements
  {
    name: 'Solar Panel Expert',
    description: 'Complete 5 Solar Panels lessons',
    icon: '🔆',
    category: 'mastery',
    points: 40,
    requirements: {
      type: 'categories_mastered',
      value: 5,
      category: 'Solar Panels'
    },
    rarity: 'rare'
  },
  {
    name: 'Installation Specialist',
    description: 'Complete 5 Home Installation lessons',
    icon: '🏠',
    category: 'mastery',
    points: 40,
    requirements: {
      type: 'categories_mastered',
      value: 5,
      category: 'Home Installation'
    },
    rarity: 'rare'
  },
  {
    name: 'Battery Guru',
    description: 'Complete 5 Battery Storage lessons',
    icon: '🔋',
    category: 'mastery',
    points: 40,
    requirements: {
      type: 'categories_mastered',
      value: 5,
      category: 'Battery Storage'
    },
    rarity: 'rare'
  },
  {
    name: 'Cost Analyst',
    description: 'Complete 5 Cost Analysis lessons',
    icon: '💰',
    category: 'mastery',
    points: 40,
    requirements: {
      type: 'categories_mastered',
      value: 5,
      category: 'Cost Analysis'
    },
    rarity: 'rare'
  },
  {
    name: 'Maintenance Pro',
    description: 'Complete 5 Maintenance lessons',
    icon: '🔧',
    category: 'mastery',
    points: 40,
    requirements: {
      type: 'categories_mastered',
      value: 5,
      category: 'Maintenance'
    },
    rarity: 'rare'
  },
  {
    name: 'Troubleshooting Expert',
    description: 'Complete 5 Troubleshooting lessons',
    icon: '🔍',
    category: 'mastery',
    points: 40,
    requirements: {
      type: 'categories_mastered',
      value: 5,
      category: 'Troubleshooting'
    },
    rarity: 'rare'
  },

  // Points achievements
  {
    name: 'Point Collector',
    description: 'Earn 100 points',
    icon: '🎖️',
    category: 'special',
    points: 0,
    requirements: {
      type: 'total_points',
      value: 100,
      category: 'all'
    },
    rarity: 'common'
  },
  {
    name: 'Point Master',
    description: 'Earn 500 points',
    icon: '🏅',
    category: 'special',
    points: 0,
    requirements: {
      type: 'total_points',
      value: 500,
      category: 'all'
    },
    rarity: 'rare'
  },
  {
    name: 'Point Legend',
    description: 'Earn 1000 points',
    icon: '👑',
    category: 'special',
    points: 0,
    requirements: {
      type: 'total_points',
      value: 1000,
      category: 'all'
    },
    rarity: 'legendary'
  }
];

const seedAchievements = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');

    // Insert new achievements
    const result = await Achievement.insertMany(achievements);
    console.log(`✅ Seeded ${result.length} achievements`);

    // Log achievements by category
    const categories = ['learning', 'streak', 'mastery', 'special'];
    for (const category of categories) {
      const count = await Achievement.countDocuments({ category });
      console.log(`${category}: ${count} achievements`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    process.exit(1);
  }
};

seedAchievements();
