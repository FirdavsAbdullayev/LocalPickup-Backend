require('dotenv').config();

const sslOptions = {
  require: true,
  rejectUnauthorized: false,
};

const base = {
  dialect: 'postgres',
  define: {
    underscored: false,
  },
  logging: false,
};

// To'liq connection string (Neon / Supabase / Railway) yoki alohida parametrlar
const build = (env) => {
  if (process.env.DATABASE_URL) {
    return {
      ...base,
      url: process.env.DATABASE_URL,
      dialectOptions: {
        ssl: sslOptions,
      },
    };
  }
  return {
    ...base,
    database: process.env.DB_NAME || 'local_pickup_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
  };
};

module.exports = {
  development: build('development'),
  production: build('production'),
  test: build('test'),
};