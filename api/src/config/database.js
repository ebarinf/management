'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
