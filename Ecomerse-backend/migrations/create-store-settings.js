module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StoreSettings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      storeName: {
        type: Sequelize.STRING,
        defaultValue: 'E-Store',
      },
      storeEmail: {
        type: Sequelize.STRING,
        defaultValue: 'contact@estore.com',
      },
      storePhone: {
        type: Sequelize.STRING,
        defaultValue: '+1 (555) 123-4567',
      },
      storeAddress: {
        type: Sequelize.STRING,
        defaultValue: '123 Commerce St, New York, NY 10001',
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD',
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: 'America/New_York',
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'en',
      },
      paymentMethods: {
        type: Sequelize.JSON,
      },
      shippingMethods: {
        type: Sequelize.JSON,
      },
      emailSettings: {
        type: Sequelize.JSON,
      },
      securitySettings: {
        type: Sequelize.JSON,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StoreSettings');
  },
};
