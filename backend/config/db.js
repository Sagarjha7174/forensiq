const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '';
const shouldUseSSL = process.env.DB_SSL === 'true' || dbHost.includes('tidbcloud.com');

const sslConfig = shouldUseSSL
  ? {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    }
  : undefined;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
  dialectOptions: sslConfig ? { ssl: sslConfig } : {},
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
