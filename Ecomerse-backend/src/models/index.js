const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Cart = require('./Cart');
const Review = require('./Review');

// Define all associations - ONCE
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Review associations - only define ONCE
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' }); // Remove the 'as' alias

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  User,
  Product,
  Order,
  Cart,
  Review
};