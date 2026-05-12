const express = require('express');
const dotenv = require('dotenv');
const swaggerSetup = require('./config/swagger');
const cors = require('cors');
const { connectPostgres } = require('./config/postgres');
// ensure models are registered (associations)
require('./models');

dotenv.config();
// use PostgreSQL instead of MongoDB
connectPostgres().then(() => {
  const { sequelize } = require('./config/postgres');
  sequelize.sync({ alter: true }); // keep development schema in sync with model changes
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// swagger docs
swaggerSetup(app);

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

module.exports = app;
