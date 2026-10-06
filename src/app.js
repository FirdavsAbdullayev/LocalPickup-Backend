const express = require('express');
const cors = require('cors');

// 1. Asosiy router yoki individual routerlarni import qilish
const mainRouter = require('./routes'); // Loyihangizdagi routes papkasining yo'li

const app = express();

// 2. CORS middleware - har qanday originga ruxsat va credentials
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

// 4. Health check yo'nalishi (Server ishlayotganini tekshirish uchun)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running smoothly' });
});

// 5. Asosiy API routerini ulash (IZOH OCHILDI!)
app.use('/api/v1', mainRouter);

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