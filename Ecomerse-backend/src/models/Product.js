// In /home/kaleb-wondimu/Desktop/Ecomerse-Project/Ecomerse-backend/src/models/Product.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Product = sequelize.define('Product', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  price: { 
    type: DataTypes.FLOAT, 
    allowNull: false, 
    defaultValue: 0 
  },
  stock: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  category: { 
    type: DataTypes.STRING, 
    defaultValue: 'Uncategorized' 
  },
  images: { 
    type: DataTypes.ARRAY(DataTypes.STRING), 
    defaultValue: [] 
  },
  ratings: { 
    type: DataTypes.ARRAY(DataTypes.INTEGER), 
    defaultValue: [] 
  },
  averageRating: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0 
  },
  // Soft delete fields
  isActive: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  deletedAt: { 
    type: DataTypes.DATE, 
    allowNull: true 
  }
},
{ 
  timestamps: true,
  // This ensures soft deleted records are excluded by default
  defaultScope: {
    where: {
      isActive: true
    }
  },
  scopes: {
    withDeleted: {
      where: {}
    }
  }
});

Product.prototype.calculateAverageRating = function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  this.averageRating = this.ratings.reduce((sum, r) => sum + r, 0) / this.ratings.length;
  return this.averageRating;
};

module.exports = Product;