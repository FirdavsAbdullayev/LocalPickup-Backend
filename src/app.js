const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const apiRoutes = require('./routes/v1');
const swaggerSpecs = require('./config/swagger');
const errorHandler = require('./middlewares/error');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running smoothly' });
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/api/v1', apiRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Not Found - ${req.originalUrl}` });
});

app.use(errorHandler);

module.exports = app;
