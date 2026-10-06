require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Ma'lumotlar bazasiga ulanish
    await connectDB();

    // 2. Modellarni ma'lumotlar bazasi bilan sinxronizatsiya qilish
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized (alter: true).');

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