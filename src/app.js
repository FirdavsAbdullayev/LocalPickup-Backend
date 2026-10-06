const express = require('express');
const cors = require('cors');

// 1. routes/v1 papkasidagi barcha routerlarni import qilish
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

// 5. Barcha API routerlarini /api/v1 ostida ulash
// Agar router fayllaringiz ichida yo'llar '/shops' deb yozilgan bo'lsa:
app.use('/api/v1', adminRoutes);
app.use('/api/v1', cartRoutes);
app.use('/api/v1', favoriteRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', shopRoutes);
app.use('/api/v1', userRoutes);

/* 
   Eslatma: Agar shopRoutes.js faylingiz ichida router.get('/', ...) deb yozilgan bo'lsa,
   yuqoridagi app.use('/api/v1', shopRoutes) o'rniga:
   app.use('/api/v1/shops', shopRoutes) deb ulashingiz kerak.
*/

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