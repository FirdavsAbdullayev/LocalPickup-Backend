require('dotenv').config();
const cors = require('cors'); // 1. CORS ulandi
const app = require('./app');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

// 2. CORS middleware barcha so'rovlarga ruxsat berish uchun qo'shildi
app.use(cors({
  origin: '*',
  credentials: true
}));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized (alter: true).');
  } catch (error) {
    console.error('❌ Model sync error:', error);
    process.exit(1);
  }

  // 3. Railway bulutli muhitida ishlashi uchun '0.0.0.0' qo'shildi
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 Swagger Docs: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
  });
};

startServer();