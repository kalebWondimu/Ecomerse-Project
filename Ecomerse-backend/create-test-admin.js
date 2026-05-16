require('dotenv').config();
const { sequelize } = require('./src/config/postgres');
const { User } = require('./src/models');

const createTestAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Delete existing test user if exists
    await User.destroy({
      where: { email: 'admin-test@example.com' }
    });

    // Create new admin - pass plain text, let beforeCreate hook hash it
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin-test@example.com',
      password: 'admin123',  // Plain text - hook will hash it!
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin St',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345',
      isVerified: true
    });

    console.log('✓ Admin account created successfully!');
    console.log('Email: admin-test@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createTestAdmin();
