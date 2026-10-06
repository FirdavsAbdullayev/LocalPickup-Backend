const express = require('express');
const cors = require('cors');

const app = express();

// 1. CORS - har qanday domen so'rovini to'g'ri qabul qilish va credentials xatosini oldini olish
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health check yo'nalishi (Railway va monitoring uchun)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running smoothly' });
});

// 4. Asosiy API yo'nalishlarini (routes) shu yerdan uling:
// const mainRouter = require('./routes');
// app.use('/api/v1', mainRouter);

// 5. Global xatoliklarni ushlab qoluvchi middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;