const dns = require('dns');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'postgres';
const dbHost = process.env.DB_HOST || '';
const dbUser = process.env.DB_USER || process.env.DB_USERNAME || 'postgres';
const dbPassword = process.env.DB_PASSWORD || null;
const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'forensiq_db';
const dbTestName = process.env.DB_NAME_TEST || 'forensiq_db_test';
const dbPort = Number(process.env.DB_PORT || (dbDialect === 'postgres' ? 5432 : 3306));
const rawDatabaseUrl = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
const databaseUrl = rawDatabaseUrl?.replace(/^postgresql:\/\//i, 'postgres://');
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}
const forceIpv4 = process.env.DB_FORCE_IPV4 !== 'false';
if (forceIpv4) {
  dns.setDefaultResultOrder('ipv4first');
}
const shouldUseSSL =
  process.env.DB_SSL === 'true' || Boolean(databaseUrl) || process.env.NODE_ENV === 'production';
const dialectOptions = shouldUseSSL
  ? {
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      },
      ...(forceIpv4 ? { family: 4 } : {})
    }
  : forceIpv4
    ? { family: 4 }
    : undefined;

module.exports = {
  development: {
    use_env_variable: databaseUrl ? 'DATABASE_URL' : undefined,
    username: dbUser,
    password: dbPassword,
    database: dbName,
    host: dbHost || '127.0.0.1',
    port: dbPort,
    dialect: dbDialect,
    logging: false,
    ...(dialectOptions ? { dialectOptions } : {})
  },
  test: {
    use_env_variable: databaseUrl ? 'DATABASE_URL' : undefined,
    username: dbUser,
    password: dbPassword,
    database: dbTestName,
    host: dbHost || '127.0.0.1',
    port: dbPort,
    dialect: dbDialect,
    logging: false,
    ...(dialectOptions ? { dialectOptions } : {})
  },
  production: {
    use_env_variable: databaseUrl ? 'DATABASE_URL' : undefined,
    username: dbUser,
    password: dbPassword,
    database: dbName,
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    logging: false,
    ...(dialectOptions ? { dialectOptions } : {})
  }
};
