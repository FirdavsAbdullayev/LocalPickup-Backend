const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const globalErrorHandler = require('./middlewares/error');
const AppError = require('./utils/AppError');

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));

// ─── API Docs ─────────────────────────────────────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/users',     require('./routes/v1/userRoutes'));
app.use('/api/v1/shops',     require('./routes/v1/shopRoutes'));
app.use('/api/v1/products',  require('./routes/v1/productRoutes'));
app.use('/api/v1/orders',    require('./routes/v1/orderRoutes'));
app.use('/api/v1/cart',      require('./routes/v1/cartRoutes'));
app.use('/api/v1/favorites', require('./routes/v1/favoriteRoutes'));
app.use('/api/v1/admin',     require('./routes/v1/adminRoutes'));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => next(new AppError(`Route ${req.originalUrl} not found.`, 404)));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;

