const express = require('express');
const cors = require('cors');

// Routerlarni to'g'ridan-to'g'ri routes/v1 papkasidan chaqiramiz
const adminRoutes = require('./routes/v1/adminRoutes');
const cartRoutes = require('./routes/v1/cartRoutes');
const favoriteRoutes = require('./routes/v1/favoriteRoutes');
const orderRoutes = require('./routes/v1/orderRoutes');
const productRoutes = require('./routes/v1/productRoutes');
const shopRoutes = require('./routes/v1/shopRoutes');
const userRoutes = require('./routes/v1/userRoutes');

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

// Routerlarni ishga tushirish
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/shops', shopRoutes);
app.use('/api/v1/users', userRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Not Found - ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

module.exports = app;