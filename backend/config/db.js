const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'postgres';
const dbHost = process.env.DB_HOST || '';
const dbUser = process.env.DB_USER || process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || process.env.DB_DATABASE;
const dbPort = Number(process.env.DB_PORT || (dbDialect === 'postgres' ? 5432 : 3306));
const shouldUseSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const sslConfig = shouldUseSSL
  ? {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    }
  : undefined;

const options = {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: false,
  dialectOptions: sslConfig ? { ssl: sslConfig } : {},
  define: {
    timestamps: true
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, options)
  : new Sequelize(dbName, dbUser, dbPassword, options);

module.exports = sequelize;
