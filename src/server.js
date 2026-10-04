require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Connect to Database and Sync Models
const startServer = async () => {
  await connectDB();
  
  // Sync all defined models to the DB
  try {
    await sequelize.sync({ alter: true }); // Use alter to update tables to match models
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('An error occurred while synchronizing the models:', error);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api/v1/docs`);
  });
};

startServer();
