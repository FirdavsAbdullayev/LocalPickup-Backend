const express = require('express');
const cors = require('cors');

// 1. Routerlarni routes/v1 papkasidan to'g'ridan-to'g'ri import qilamiz
const adminRoutes = require('./routes/v1/adminRoutes');
const cartRoutes = require('./routes/v1/cartRoutes');
const favoriteRoutes = require('./routes/v1/favoriteRoutes');
const orderRoutes = require('./routes/v1/orderRoutes');
const productRoutes = require('./routes/v1/productRoutes');
const shopRoutes = require('./routes/v1/shopRoutes');
const userRoutes = require('./routes/v1/userRoutes');

const app = express();

// 2. CORS middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Health check yo'nalishi
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running smoothly' });
});

// 5. Barcha API routerlarini alohida-alohida ulash
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/shops', shopRoutes);
app.use('/api/v1/users', userRoutes);

// 6. Mavjud bo'lmagan yo'llar uchun 404 middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

// 7. Global xatoliklarni ushlab qoluvchi middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;