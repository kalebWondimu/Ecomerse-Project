// In /home/kaleb-wondimu/Desktop/Ecomerse-Project/Ecomerse-backend/src/models/Order.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Order = sequelize.define('Order', {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  items: { 
    type: DataTypes.JSONB, 
    defaultValue: [] 
  },
  totalAmount: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0 
  },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'pending' 
  },
  paymentMethod: { 
    type: DataTypes.STRING 
  },
  paymentStatus: { 
    type: DataTypes.STRING, 
    defaultValue: 'pending' 
  },
  shippingAddress: { 
    type: DataTypes.TEXT 
  }
},
{ 
  timestamps: true 
});

// Define association
Order.associate = (models) => {
  Order.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Order;