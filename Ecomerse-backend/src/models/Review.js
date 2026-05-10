const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Review = sequelize.define('Review', {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  productId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  rating: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    validate: { min: 1, max: 5 } 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  comment: { 
    type: DataTypes.TEXT,
    allowNull: false 
  },
  images: { 
    type: DataTypes.ARRAY(DataTypes.STRING), 
    defaultValue: [] 
  },
  helpfulCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  helpfulUsers: { 
    type: DataTypes.ARRAY(DataTypes.INTEGER), 
    defaultValue: [] 
  },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
    defaultValue: 'approved' 
  },
  verified: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  replies: { 
  type: DataTypes.JSONB, 
  defaultValue: [],
  allowNull: false,
  get() {
    const rawValue = this.getDataValue('replies');
    return Array.isArray(rawValue) ? rawValue : [];
  },
  set(value) {
    this.setDataValue('replies', Array.isArray(value) ? value : []);
  }
}
},
{ 
  timestamps: true 
});

// Define association
Review.belongsTo(require('./User'), { 
  foreignKey: 'userId',
  as: 'user'
});

module.exports = Review;