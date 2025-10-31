const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  consumption: {
    type: Number,
    required: true,
    min: [0, 'Consumption cannot be negative'],
    unit: 'kWh'
  },
  cost: {
    type: Number,
    required: true,
    min: [0, 'Cost cannot be negative'],
    unit: 'USD'
  },
  peakHours: {
    type: Number,
    default: 0,
    min: [0, 'Peak hours cannot be negative']
  },
  offPeakHours: {
    type: Number,
    default: 0,
    min: [0, 'Off-peak hours cannot be negative']
  },
  source: {
    type: String,
    enum: ['solar', 'wind', 'hydro', 'fossil', 'nuclear', 'mixed'],
    default: 'mixed'
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },
  deviceType: {
    type: String,
    enum: ['smart_meter', 'manual_entry', 'iot_device', 'estimate'],
    default: 'manual_entry'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
energySchema.index({ userId: 1, date: -1 });
energySchema.index({ date: -1 });
energySchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for total hours
energySchema.virtual('totalHours').get(function() {
  return this.peakHours + this.offPeakHours;
});

// Virtual for cost per kWh
energySchema.virtual('costPerKwh').get(function() {
  return this.consumption > 0 ? this.cost / this.consumption : 0;
});

// Static method to get monthly summary for a user
energySchema.statics.getMonthlySummary = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const summary = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalConsumption: { $sum: '$consumption' },
        totalCost: { $sum: '$cost' },
        totalPeakHours: { $sum: '$peakHours' },
        totalOffPeakHours: { $sum: '$offPeakHours' },
        averageCostPerKwh: { $avg: { $divide: ['$cost', '$consumption'] } },
        daysCount: { $sum: 1 }
      }
    }
  ]);
  
  return summary[0] || {
    totalConsumption: 0,
    totalCost: 0,
    totalPeakHours: 0,
    totalOffPeakHours: 0,
    averageCostPerKwh: 0,
    daysCount: 0
  };
};

// Static method to get yearly summary for a user
energySchema.statics.getYearlySummary = async function(userId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  const summary = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $month: '$date' },
        totalConsumption: { $sum: '$consumption' },
        totalCost: { $sum: '$cost' },
        totalPeakHours: { $sum: '$peakHours' },
        totalOffPeakHours: { $sum: '$offPeakHours' },
        averageCostPerKwh: { $avg: { $divide: ['$cost', '$consumption'] } },
        daysCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  return summary;
};

// Static method to get cost comparison
energySchema.statics.getCostComparison = async function(userId, period = 'month') {
  const now = new Date();
  let startDate, endDate;
  
  if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }
  
  const currentPeriod = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        totalConsumption: { $sum: '$consumption' }
      }
    }
  ]);
  
  // Get previous period for comparison
  const previousStartDate = new Date(startDate);
  const previousEndDate = new Date(endDate);
  
  if (period === 'month') {
    previousStartDate.setMonth(previousStartDate.getMonth() - 1);
    previousEndDate.setMonth(previousEndDate.getMonth() - 1);
  } else if (period === 'year') {
    previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
    previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
  }
  
  const previousPeriod = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: previousStartDate, $lte: previousEndDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: '$cost' },
        totalConsumption: { $sum: '$consumption' }
      }
    }
  ]);
  
  const current = currentPeriod[0] || { totalCost: 0, totalConsumption: 0 };
  const previous = previousPeriod[0] || { totalCost: 0, totalConsumption: 0 };
  
  const costChange = previous.totalCost > 0 
    ? ((current.totalCost - previous.totalCost) / previous.totalCost) * 100 
    : 0;
    
  const consumptionChange = previous.totalConsumption > 0 
    ? ((current.totalConsumption - previous.totalConsumption) / previous.totalConsumption) * 100 
    : 0;
  
  return {
    current: {
      cost: current.totalCost,
      consumption: current.totalConsumption
    },
    previous: {
      cost: previous.totalCost,
      consumption: previous.totalConsumption
    },
    changes: {
      cost: costChange,
      consumption: consumptionChange
    }
  };
};

const Energy = mongoose.model('Energy', energySchema);

module.exports = Energy;

