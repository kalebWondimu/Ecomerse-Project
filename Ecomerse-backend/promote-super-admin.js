require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/config/postgres');

const EMAIL_TO_PROMOTE = 'kalebwondimu95@gmail.com'; 

const promoteSuperAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const user = await User.findOne({ where: { email: EMAIL_TO_PROMOTE } });

    if (!user) {
      console.error(`User with email ${EMAIL_TO_PROMOTE} not found`);
      process.exit(1);
    }

    await user.update({ role: 'super-admin' });
    console.log(`✓ User ${user.name} (${user.email}) has been promoted to super-admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error promoting super-admin:', error);
    process.exit(1);
  }
};

promoteSuperAdmin();
