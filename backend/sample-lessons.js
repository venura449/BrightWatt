// sample-lessons.js

// Load environment variables
require('dotenv').config();

const { connectDB } = require('./config/database.js');
const Lesson = require('./models/Lesson');

// Sample lessons data for BrightWatt solar education app
const sampleLessons = [
  {
    title: 'What is Solar Energy?',
    description: 'Introduction to solar energy and how it works. Learn the basics of photovoltaic technology and why solar power is becoming the future of energy.',
    duration: '8 min',
    difficulty: 'Beginner',
    category: 'Solar Panels',
    thumbnail: '🌞',
    youtubeUrl: 'https://youtube.com/watch?v=example1',
    order: 1,
    tags: ['solar energy', 'basics', 'introduction'],
    learningObjectives: [
      'Understand what solar energy is',
      'Learn how sunlight becomes electricity',
      'Know the benefits of solar power'
    ]
  },
  {
    title: 'How Solar Panels Work',
    description: 'Understanding photovoltaic effect and panel structure. Deep dive into the science behind solar panel technology.',
    duration: '12 min',
    difficulty: 'Beginner',
    category: 'Solar Panels',
    thumbnail: '⚡',
    youtubeUrl: 'https://youtube.com/watch?v=example2',
    order: 2,
    tags: ['photovoltaic', 'solar cells', 'electricity generation'],
    learningObjectives: [
      'Understand the photovoltaic effect',
      'Know how solar cells work',
      'Learn about panel structure'
    ]
  },
  {
    title: 'Types of Solar Panels',
    description: 'Monocrystalline, polycrystalline, and thin-film panels. Compare different panel technologies and their applications.',
    duration: '15 min',
    difficulty: 'Beginner',
    category: 'Solar Panels',
    thumbnail: '🔋',
    youtubeUrl: 'https://youtube.com/watch?v=example3',
    order: 3,
    tags: ['monocrystalline', 'polycrystalline', 'thin-film'],
    learningObjectives: [
      'Identify different panel types',
      'Understand efficiency differences',
      'Choose the right panel for your needs'
    ]
  },
  {
    title: 'Solar Panel Efficiency',
    description: 'Factors affecting solar panel performance. Learn about temperature, shading, and orientation impacts.',
    duration: '18 min',
    difficulty: 'Intermediate',
    category: 'Solar Panels',
    thumbnail: '📊',
    youtubeUrl: 'https://youtube.com/watch?v=example4',
    order: 4,
    tags: ['efficiency', 'performance', 'optimization'],
    learningObjectives: [
      'Understand efficiency factors',
      'Learn about temperature effects',
      'Know how to optimize performance'
    ]
  },
  {
    title: 'Solar Panel Installation Basics',
    description: 'Step-by-step installation guide for residential solar systems. Safety, tools, and best practices.',
    duration: '25 min',
    difficulty: 'Intermediate',
    category: 'Home Installation',
    thumbnail: '🏠',
    youtubeUrl: 'https://youtube.com/watch?v=example5',
    order: 5,
    tags: ['installation', 'residential', 'safety'],
    learningObjectives: [
      'Understand installation steps',
      'Know safety requirements',
      'Learn best practices'
    ]
  },
  {
    title: 'Roof Mounting Systems',
    description: 'Different mounting options for residential installations. Racking systems, roof types, and mounting considerations.',
    duration: '20 min',
    difficulty: 'Intermediate',
    category: 'Home Installation',
    thumbnail: '🔧',
    youtubeUrl: 'https://youtube.com/watch?v=example6',
    order: 6,
    tags: ['mounting', 'racking', 'roof types'],
    learningObjectives: [
      'Understand mounting options',
      'Know roof considerations',
      'Learn about racking systems'
    ]
  },
  {
    title: 'Battery Storage Fundamentals',
    description: 'Understanding solar battery systems. Learn about energy storage, battery types, and system integration.',
    duration: '22 min',
    difficulty: 'Intermediate',
    category: 'Battery Storage',
    thumbnail: '🔋',
    youtubeUrl: 'https://youtube.com/watch?v=example7',
    order: 7,
    tags: ['battery storage', 'energy storage', 'system integration'],
    learningObjectives: [
      'Understand battery basics',
      'Know storage options',
      'Learn system integration'
    ]
  },
  {
    title: 'Grid-Tied vs Off-Grid Systems',
    description: 'Comparing different solar system configurations. Understand the pros and cons of each approach.',
    duration: '16 min',
    difficulty: 'Intermediate',
    category: 'Battery Storage',
    thumbnail: '🌐',
    youtubeUrl: 'https://youtube.com/watch?v=example8',
    order: 8,
    tags: ['grid-tied', 'off-grid', 'system design'],
    learningObjectives: [
      'Compare system types',
      'Understand pros and cons',
      'Choose the right system'
    ]
  },
  {
    title: 'Solar Cost Analysis',
    description: 'Calculating ROI and payback period. Learn about costs, savings, and financial benefits of solar.',
    duration: '30 min',
    difficulty: 'Advanced',
    category: 'Cost Analysis',
    thumbnail: '💰',
    youtubeUrl: 'https://youtube.com/watch?v=example9',
    order: 9,
    tags: ['cost analysis', 'ROI', 'payback period'],
    learningObjectives: [
      'Calculate solar costs',
      'Understand ROI factors',
      'Determine payback period'
    ]
  },
  {
    title: 'Government Incentives',
    description: 'Tax credits and rebates for solar installations. Learn about available financial incentives and how to claim them.',
    duration: '14 min',
    difficulty: 'Intermediate',
    category: 'Cost Analysis',
    thumbnail: '🏛️',
    youtubeUrl: 'https://youtube.com/watch?v=example10',
    order: 10,
    tags: ['incentives', 'tax credits', 'rebates'],
    learningObjectives: [
      'Know available incentives',
      'Understand tax credits',
      'Learn how to claim rebates'
    ]
  },
  {
    title: 'Solar Panel Maintenance',
    description: 'Keeping your solar panels clean and efficient. Regular maintenance tasks and troubleshooting tips.',
    duration: '12 min',
    difficulty: 'Beginner',
    category: 'Solar Panels',
    thumbnail: '🧹',
    youtubeUrl: 'https://youtube.com/watch?v=example11',
    order: 11,
    tags: ['maintenance', 'cleaning', 'efficiency'],
    learningObjectives: [
      'Learn maintenance tasks',
      'Understand cleaning methods',
      'Know troubleshooting tips'
    ]
  },
  {
    title: 'Troubleshooting Common Issues',
    description: 'Fixing typical solar panel problems. Diagnose and resolve common system issues.',
    duration: '20 min',
    difficulty: 'Advanced',
    category: 'Solar Panels',
    thumbnail: '🔍',
    youtubeUrl: 'https://youtube.com/watch?v=example12',
    order: 12,
    tags: ['troubleshooting', 'diagnosis', 'repair'],
    learningObjectives: [
      'Diagnose common problems',
      'Understand troubleshooting steps',
      'Learn repair techniques'
    ]
  }
];

const populateLessons = async () => {
  try {
    await Lesson.deleteMany({});
    console.log('Cleared existing lessons');
    
    const lessons = await Lesson.insertMany(sampleLessons);
    console.log(`Successfully inserted ${lessons.length} lessons`);
    lessons.forEach(lesson => {
      console.log(`- ${lesson.title} (${lesson.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error populating lessons:', error);
    process.exit(1);
  }
};

// Connect same way as backend
(async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully (script)');
    await populateLessons();
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
})();
