require('dotenv').config();
const bcryptjs = require('bcryptjs');
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

    // Create new admin with properly hashed password
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin-test@example.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      address: '123 Admin St',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345'
    });

    console.log('✓ Admin account created successfully!');
    console.log('Email: admin-test@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestAdmin();
