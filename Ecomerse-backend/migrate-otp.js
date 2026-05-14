const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./src/config/postgres');
const { QueryTypes } = require('sequelize');

const addOTPColumns = async () => {
  try {
    console.log('Checking and adding OTP columns to Users table...');

    const otpColumnExists = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'otp'",
      { type: QueryTypes.SELECT }
    );

    if (otpColumnExists.length === 0) {
      console.log('Adding otp column...');
      await sequelize.query('ALTER TABLE "Users" ADD COLUMN "otp" VARCHAR(255)', { type: QueryTypes.RAW });
    } else {
      console.log('otp column already exists');
    }

    // Check if otpExpires column exists
    const otpExpiresColumnExists = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'otpExpires'",
      { type: QueryTypes.SELECT }
    );

    if (otpExpiresColumnExists.length === 0) {
      console.log('Adding otpExpires column...');
      await sequelize.query('ALTER TABLE "Users" ADD COLUMN "otpExpires" TIMESTAMP', { type: QueryTypes.RAW });
    } else {
      console.log('otpExpires column already exists');
    }

    console.log('OTP columns migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during OTP columns migration:', error);
    process.exit(1);
  }
};

// Run the migration
addOTPColumns();