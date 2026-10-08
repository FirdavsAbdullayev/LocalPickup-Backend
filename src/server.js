require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Ma'lumotlar bazasiga ulanish
    await connectDB();

    // 2. Sxema: production'da migratsiyalar (sequelize-cli db:migrate),
    //    development'da qulaylik uchun lightweight sync
    if (process.env.NODE_ENV === 'production') {
      console.log('ℹ️ Schema managed by migrations. Run `npm run migrate` before start.');
    } else {
      await sequelize.sync();
      console.log('✅ Dev schema synchronized.');
    }

    // 3. Railway va bulutli muhitlar uchun '0.0.0.0' hamda dinamik PORT bilan eshitish
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Swagger Docs: http://localhost:${PORT}/api/v1/docs`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();