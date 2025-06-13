const { Telegraf } = require('telegraf');

const bot = new Telegraf('7991511524:AAE1ReD73oQ7p8MRhLtj8UQZf8FxTA1OeG0');

// Status Anti-Link (default: mati)
let antiLinkOn = false;

// Perintah /start
bot.start((ctx) => {
  ctx.reply('👋 Halo! Bot Anti-Link aktif. Gunakan /antilink on untuk mengaktifkan, /antilink off untuk mematikan.');
});

// Perintah /antilink on
bot.command('antilink', (ctx) => {
  const arg = ctx.message.text.split(' ')[1];
  if (arg === 'on') {
    antiLinkOn = true;
    return ctx.reply('✅ Anti-Link telah *diaktifkan*.', { parse_mode: 'Markdown' });
  } else if (arg === 'off') {
    antiLinkOn = false;
    return ctx.reply('❌ Anti-Link telah *dimatikan*.', { parse_mode: 'Markdown' });
  } else {
    return ctx.reply('Gunakan format: /antilink on atau /antilink off');
  }
});

// Deteksi pesan yang mengandung link
bot.on('message', async (ctx) => {
  if (!antiLinkOn) return;

  const text = ctx.message.text || '';
  const linkRegex = /(https?:\/\/|t\.me\/|telegram\.me\/|www\.)\S+/i;

  if (linkRegex.test(text)) {
    try {
      await ctx.deleteMessage();
      console.log(`🔗 Pesan dihapus dari ${ctx.from.username || ctx.from.first_name}`);
    } catch (err) {
      console.error('Gagal menghapus pesan:', err.message);
    }
  }
});

// Mulai bot
bot.launch().then(() => {
  console.log('🤖 Bot Anti-Link siap digunakan!');
});