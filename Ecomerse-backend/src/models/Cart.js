const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

// items stored as JSON array: [{ productId, quantity }]
const Cart = sequelize.define('Cart', {
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  items: { type: DataTypes.JSONB, defaultValue: [] },
  totalPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
},
{ timestamps: true });

module.exports = Cart;
