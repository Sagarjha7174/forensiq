const { Sequelize } = require('sequelize');
const dns = require('dns');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'postgres';
const dbHost = process.env.DB_HOST || '';
const dbUser = process.env.DB_USER || process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || process.env.DB_DATABASE;
const dbPort = Number(process.env.DB_PORT || (dbDialect === 'postgres' ? 5432 : 3306));
const rawDatabaseUrl = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
const normalizeDatabaseUrl = (url) => {
  if (!url) return undefined;
  const normalized = url.replace(/^postgresql:\/\//i, 'postgres://');

  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false') {
    if (/sslmode=/i.test(normalized)) {
      return normalized.replace(/sslmode=[^&]*/i, 'sslmode=no-verify');
    }
    return `${normalized}${normalized.includes('?') ? '&' : '?'}sslmode=no-verify`;
  }

  return normalized;
};
const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const forceIpv4 = process.env.DB_FORCE_IPV4 !== 'false';
if (forceIpv4) {
  dns.setDefaultResultOrder('ipv4first');
}
const shouldUseSSL =
  process.env.DB_SSL === 'true' || Boolean(databaseUrl) || process.env.NODE_ENV === 'production';

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
  dialectOptions: {
    ...(sslConfig ? { ssl: sslConfig } : {}),
    ...(forceIpv4 ? { family: 4 } : {})
  },
  define: {
    timestamps: true
  }
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, options)
  : new Sequelize(dbName, dbUser, dbPassword, options);

module.exports = sequelize;
