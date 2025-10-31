const mongoose = require('mongoose');
const QuizQuestion = require('./models/QuizQuestion');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brightwatt');

const quizQuestions = [
  // Solar Panels Category
  {
    question: "Do solar panels work on cloudy days?",
    correctAnswer: "yes",
    explanation: "Solar panels still generate electricity on cloudy days, though at reduced efficiency (10-25% of full capacity).",
    category: "solar_panels",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Can solar panels generate electricity at night?",
    correctAnswer: "no",
    explanation: "Solar panels require sunlight to generate electricity. At night, they produce no power.",
    category: "solar_panels",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Do solar panels require direct sunlight to work?",
    correctAnswer: "no",
    explanation: "Solar panels can generate electricity from indirect sunlight, though direct sunlight provides maximum efficiency.",
    category: "solar_panels",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can solar panels work in cold weather?",
    correctAnswer: "yes",
    explanation: "Solar panels actually work more efficiently in cold weather. Heat reduces their efficiency.",
    category: "solar_panels",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar panels last forever?",
    correctAnswer: "no",
    explanation: "Solar panels typically last 25-30 years with gradual efficiency decline over time.",
    category: "solar_panels",
    difficulty: "easy",
    points: 5
  },

  // Installation Category
  {
    question: "Can solar panels be installed on any roof?",
    correctAnswer: "no",
    explanation: "Solar panels require adequate structural support, proper orientation, and sufficient space. Not all roofs are suitable.",
    category: "installation",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar panels damage the roof?",
    correctAnswer: "no",
    explanation: "Properly installed solar panels protect the roof and can extend its lifespan by shielding it from weather.",
    category: "installation",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can solar panels be installed on flat roofs?",
    correctAnswer: "yes",
    explanation: "Solar panels can be installed on flat roofs using mounting systems that angle them toward the sun.",
    category: "installation",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Do solar installations require permits?",
    correctAnswer: "yes",
    explanation: "Most jurisdictions require building permits and electrical permits for solar installations.",
    category: "installation",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can solar panels be installed in winter?",
    correctAnswer: "yes",
    explanation: "Solar panels can be installed year-round, though weather conditions may affect installation time.",
    category: "installation",
    difficulty: "easy",
    points: 5
  },

  // Battery Storage Category
  {
    question: "Do solar batteries work during power outages?",
    correctAnswer: "yes",
    explanation: "Solar batteries with backup capability can provide power during grid outages.",
    category: "battery_storage",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can you add batteries to existing solar systems?",
    correctAnswer: "yes",
    explanation: "Batteries can typically be added to existing solar systems, though some may require inverter upgrades.",
    category: "battery_storage",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar batteries require maintenance?",
    correctAnswer: "yes",
    explanation: "While low-maintenance, solar batteries require periodic monitoring and occasional maintenance.",
    category: "battery_storage",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can batteries store unlimited energy?",
    correctAnswer: "no",
    explanation: "Batteries have limited storage capacity and cannot store unlimited amounts of energy.",
    category: "battery_storage",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Do all solar systems include batteries?",
    correctAnswer: "no",
    explanation: "Many solar systems are grid-tied without batteries. Batteries are optional for backup power.",
    category: "battery_storage",
    difficulty: "easy",
    points: 5
  },

  // Cost Analysis Category
  {
    question: "Do solar panels increase home value?",
    correctAnswer: "yes",
    explanation: "Studies show solar panels typically increase home value by 3-4% on average.",
    category: "cost_analysis",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Are there tax incentives for solar installations?",
    correctAnswer: "yes",
    explanation: "Federal and many state governments offer tax credits and incentives for solar installations.",
    category: "cost_analysis",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Do solar panels eliminate electricity bills completely?",
    correctAnswer: "no",
    explanation: "While solar panels can significantly reduce bills, most homes still have some connection fees and may not generate 100% of their needs.",
    category: "cost_analysis",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Is solar energy cheaper than grid electricity?",
    correctAnswer: "yes",
    explanation: "Over the long term, solar energy is typically cheaper than grid electricity, especially with rising utility rates.",
    category: "cost_analysis",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar panels pay for themselves?",
    correctAnswer: "yes",
    explanation: "Solar panels typically pay for themselves through energy savings in 5-10 years, depending on location and system size.",
    category: "cost_analysis",
    difficulty: "medium",
    points: 10
  },

  // Maintenance Category
  {
    question: "Do solar panels require regular cleaning?",
    correctAnswer: "yes",
    explanation: "Regular cleaning (2-4 times per year) helps maintain optimal efficiency by removing dust and debris.",
    category: "maintenance",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can you walk on solar panels?",
    correctAnswer: "no",
    explanation: "Walking on solar panels can damage them and void warranties. Use proper safety equipment for maintenance.",
    category: "maintenance",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Do solar panels need professional maintenance?",
    correctAnswer: "no",
    explanation: "Basic maintenance like cleaning can be done by homeowners. Professional inspections are recommended annually.",
    category: "maintenance",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can trees affect solar panel performance?",
    correctAnswer: "yes",
    explanation: "Shading from trees can significantly reduce solar panel efficiency and should be considered during installation.",
    category: "maintenance",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Do solar panels need winter protection?",
    correctAnswer: "no",
    explanation: "Solar panels are designed to withstand winter weather and snow. They can actually help melt snow due to heat generation.",
    category: "maintenance",
    difficulty: "medium",
    points: 10
  },

  // Troubleshooting Category
  {
    question: "Do solar panels make noise?",
    correctAnswer: "no",
    explanation: "Solar panels themselves are silent. Any noise usually comes from inverters or other system components.",
    category: "troubleshooting",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Can solar panels cause roof leaks?",
    correctAnswer: "no",
    explanation: "Properly installed solar panels should not cause roof leaks. Professional installers use proper sealing techniques.",
    category: "troubleshooting",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar panels attract lightning?",
    correctAnswer: "no",
    explanation: "Solar panels do not attract lightning. They are actually safer than metal objects during storms.",
    category: "troubleshooting",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can solar panels work in extreme heat?",
    correctAnswer: "yes",
    explanation: "Solar panels work in extreme heat, though efficiency decreases at very high temperatures (above 25°C/77°F).",
    category: "troubleshooting",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar panels emit radiation?",
    correctAnswer: "no",
    explanation: "Solar panels emit no harmful radiation. They only convert sunlight to electricity.",
    category: "troubleshooting",
    difficulty: "easy",
    points: 5
  },

  // General Category
  {
    question: "Is solar energy renewable?",
    correctAnswer: "yes",
    explanation: "Solar energy is completely renewable and will continue as long as the sun exists.",
    category: "general",
    difficulty: "easy",
    points: 5
  },
  {
    question: "Can solar energy power entire cities?",
    correctAnswer: "yes",
    explanation: "Solar energy has the potential to power entire cities and is already doing so in some locations.",
    category: "general",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Do solar panels work in space?",
    correctAnswer: "yes",
    explanation: "Solar panels are widely used in space applications and power satellites and space stations.",
    category: "general",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Is solar energy the most abundant energy source?",
    correctAnswer: "yes",
    explanation: "Solar energy is the most abundant energy source on Earth, providing more energy in one hour than humanity uses in a year.",
    category: "general",
    difficulty: "medium",
    points: 10
  },
  {
    question: "Can solar energy be stored for later use?",
    correctAnswer: "yes",
    explanation: "Solar energy can be stored using batteries, thermal storage, or other energy storage technologies.",
    category: "general",
    difficulty: "easy",
    points: 5
  }
];

async function seedQuizQuestions() {
  try {
    console.log('🌱 Seeding quiz questions...');
    
    // Clear existing questions
    await QuizQuestion.deleteMany({});
    console.log('✅ Cleared existing quiz questions');
    
    // Insert new questions
    const insertedQuestions = await QuizQuestion.insertMany(quizQuestions);
    console.log(`✅ Successfully seeded ${insertedQuestions.length} quiz questions`);
    
    // Log categories
    const categories = [...new Set(insertedQuestions.map(q => q.category))];
    console.log('📚 Categories seeded:', categories.join(', '));
    
    // Log difficulty distribution
    const difficulties = insertedQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Difficulty distribution:', difficulties);
    
    console.log('🎯 Quiz questions seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding quiz questions:', error);
    process.exit(1);
  }
}

seedQuizQuestions();

