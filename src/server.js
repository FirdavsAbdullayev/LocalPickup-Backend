require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

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
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 Swagger Docs: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
  });
};

startServer();
