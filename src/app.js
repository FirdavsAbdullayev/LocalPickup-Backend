const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const globalErrorHandler = require('./middlewares/error');
const AppError = require('./utils/AppError');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/v1/users', require('./routes/v1/userRoutes'));
app.use('/api/v1/shops', require('./routes/v1/shopRoutes'));
app.use('/api/v1/products', require('./routes/v1/productRoutes'));
app.use('/api/v1/reservations', require('./routes/v1/reservationRoutes'));
// Add other routes here

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
