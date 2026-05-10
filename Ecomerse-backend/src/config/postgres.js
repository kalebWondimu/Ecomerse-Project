const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();



const connectionString = process.env.PG_URI ||
  (process.env.PG_HOST && process.env.PG_USER && process.env.PG_DB
    ? `postgres://${process.env.PG_USER}:${process.env.PG_PASS||''}@${process.env.PG_HOST}:${process.env.PG_PORT||5432}/${process.env.PG_DB}`
    : null);
if (!connectionString) {
  console.error('Postgres connection string is not defined. Please set PG_URI or PG_HOST/PG_USER/PG_DB in .env');
  process.exit(1);
}

const sequelize = new Sequelize(connectionString, {
  logging: false, // set to console.log to debug
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectPostgres };
