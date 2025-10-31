const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  energyProvider: {
    type: String,
    default: 'BrightWatt Energy',
    trim: true
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Energy consumption tracking
  energyConsumption: {
    currentMonth: {
      type: Number,
      default: 0 // kWh
    },
    totalUsage: {
      type: Number,
      default: 0 // kWh
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Cost savings tracking
  costSavings: {
    currentMonth: {
      type: Number,
      default: 0 // USD
    },
    totalSavings: {
      type: Number,
      default: 0 // USD
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    energyGoal: {
      type: Number,
      default: 1000 // kWh per month
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // Learning and achievements
  learningStats: {
    totalPoints: {
      type: Number,
      default: 0
    },
    lessonsCompleted: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastLessonDate: {
      type: Date,
      default: null
    },
    perfectScores: {
      type: Number,
      default: 0
    },
    categoriesMastered: {
      type: Number,
      default: 0
    },
    categoryProgress: {
      'Solar Panels': { type: Number, default: 0 },
      'Home Installation': { type: Number, default: 0 },
      'Battery Storage': { type: Number, default: 0 },
      'Cost Analysis': { type: Number, default: 0 },
      'Maintenance': { type: Number, default: 0 },
      'Troubleshooting': { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'energyConsumption.lastUpdated': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for member duration
userSchema.virtual('memberDuration').get(function() {
  const now = new Date();
  const memberSince = this.memberSince;
  const diffTime = Math.abs(now - memberSince);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.__v;
  
  return userObject;
};

// Method to update energy consumption
userSchema.methods.updateEnergyConsumption = function(usage, cost) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Reset monthly data if it's a new month
  if (this.energyConsumption.lastUpdated.getMonth() !== currentMonth || 
      this.energyConsumption.lastUpdated.getFullYear() !== currentYear) {
    this.energyConsumption.currentMonth = 0;
    this.costSavings.currentMonth = 0;
  }
  
  this.energyConsumption.currentMonth += usage;
  this.energyConsumption.totalUsage += usage;
  this.energyConsumption.lastUpdated = now;
  
  this.costSavings.currentMonth += cost;
  this.costSavings.totalSavings += cost;
  this.costSavings.lastUpdated = now;
  
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;

