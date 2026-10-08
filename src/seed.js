require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const { sequelize, User, Category, Shop, Product } = require('./models');

const seedData = async () => {
  try {
    await connectDB();
    // Sxema migratsiyalar orqali boshqariladi. Dev'da (NP) mavjud emas bo'lsa sync qiladi.
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
    }

    console.log('🌱 Seeding platform data...');

    // 1. Super Admin
    const adminEmail = 'admin@localpickup.uz';
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = await User.create({
        fullName: 'Super Administrator',
        email: adminEmail,
        password: hashedPassword,
        phone: '+998901234567',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      });
      console.log('✅ Super Admin created: admin@localpickup.uz / admin123');
    }

    // 2. Sample Categories
    const categories = [
      { name: 'Fast Food & Taomlar', slug: 'fast-food', icon: '🍔' },
      { name: 'Ichimliklar', slug: 'ichimliklar', icon: '🥤' },
      { name: 'Shirinliklar & Qandolat', slug: 'shirinliklar', icon: '🍰' },
      { name: 'Kofe & Choy', slug: 'kofe-choy', icon: '☕' },
      { name: 'Elektronika & Aksessuarlar', slug: 'elektronika', icon: '📱' },
      { name: 'Boshqa', slug: 'boshqa', icon: '📦' },
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
    }
    console.log('✅ Default categories seeded.');

    // 3. Sample Vendor
    const vendorEmail = 'vendor@localpickup.uz';
    let vendor = await User.findOne({ where: { email: vendorEmail } });
    if (!vendor) {
      const hashedPassword = await bcrypt.hash('vendor123', 12);
      vendor = await User.create({
        fullName: 'Anvar Sotuvchi',
        email: vendorEmail,
        password: hashedPassword,
        phone: '+998939876543',
        role: 'VENDOR',
        status: 'ACTIVE',
      });
      console.log('✅ Sample Vendor created: vendor@localpickup.uz / vendor123');
    }

    // 4. Sample Shop
    let shop = await Shop.findOne({ where: { ownerId: vendor.id } });
    if (!shop) {
      shop = await Shop.create({
        ownerId: vendor.id,
        name: 'Oqtepa Lavash Chilonzor',
        slug: 'oqtepa-lavash-chilonzor',
        description: 'Toshkentning eng mazali lavashlari va tez tayyorlanadigan milliy taomlari.',
        address: 'Toshkent sh., Chilonzor 9-mavze, 12-uy',
        phone: '+998712008989',
        isApproved: true,
      });
      console.log('✅ Sample Shop created:', shop.name);

      const fastFoodCat = await Category.findOne({ where: { slug: 'fast-food' } });

      await Product.bulkCreate([
        {
          shopId: shop.id,
          categoryId: fastFoodCat?.id,
          title: 'Lavash Standart (Mol go\'shti)',
          description: 'Yupqa xamir, marinadlangan yumshoq mol go\'shti, chips, bodring va pomidor bilan.',
          price: 36000,
          discountPrice: 32000,
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
          stockQuantity: 50,
          isAvailable: true,
        },
        {
          shopId: shop.id,
          categoryId: fastFoodCat?.id,
          title: 'Gamburger Cheese Max',
          description: 'Yumshoq bulkada suvli kotlet, erigan pishloq va maxsus sous.',
          price: 28000,
          discountPrice: null,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          stockQuantity: 30,
          isAvailable: true,
        },
      ]);
      console.log('✅ Sample Products created.');
    }

    console.log('🎉 Seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
