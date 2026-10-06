const TelegramBot = require('node-telegram-bot-api');

let bot = null;

if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('🤖 Telegram Bot service initialized.');
  } catch (err) {
    console.warn('⚠️ Telegram Bot initialization failed:', err.message);
  }
} else {
  console.log('ℹ️ TELEGRAM_BOT_TOKEN not provided. Telegram notifications disabled.');
}

/**
 * Send real-time notification to Vendor via Telegram
 */
exports.notifyVendorNewOrder = async ({ order, shop, vendor, customer, items }) => {
  const chatId = vendor?.telegramChatId || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!bot || !chatId) return;

  try {
    const itemsList = items
      .map(i => `▫️ <b>${i.product?.title || 'Mahsulot'}</b>: ${i.quantity} dona × ${(Number(i.unitPrice)).toLocaleString()} so'm`)
      .join('\n');

    const pickupTimeStr = order.pickupTime
      ? new Date(order.pickupTime).toLocaleString('uz-UZ')
      : 'Ko\'rsatilmagan';

    const message = `
🔔 <b>YANGI BUYURTMA! #${order.id.slice(0, 8)}</b>
🏪 <b>Do'kon:</b> ${shop?.name || '-'}

👤 <b>Mijoz:</b> ${customer?.fullName || 'Noma\'lum'}
📞 <b>Telefon:</b> ${customer?.phone || customer?.email || '-'}
⏰ <b>Olib ketish vaqti:</b> ${pickupTimeStr}

📋 <b>Tarkibi:</b>
${itemsList}

💰 <b>Umumiy summa:</b> <b>${Number(order.totalAmount).toLocaleString()} so'm</b>
⚡️ <i>Iltimos, vendor panelidan buyurtmani qabul qiling!</i>
`.trim();

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log(`✅ Telegram notification sent to chat ${chatId}`);
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error.message);
  }
};
