const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
},
{ timestamps: true });

module.exports = Category;
