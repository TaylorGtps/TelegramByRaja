const { Telegraf } = require('telegraf');

// Ganti token dengan punyamu
const bot = new Telegraf('7991511524:AAE1ReD73oQ7p8MRhLtj8UQZf8FxTA1OeG0');

// Data memori (tanpa file tambahan)
const allowedGroups = [];
const whitelist = [];

// Deteksi semua jenis domain/link umum
const linkRegex = /(?:https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|id|net|org|xyz|co|me|gg|tech|info|link|store|site|online|top|live|app|web|edu|gov|tv|in|io|to|sh|biz|club|page|pw|cc|uk|my|cn|de|fr|es|us|au|jp|kr|ru|vn|ph))\b/i;

// /start
bot.start((ctx) => {
  ctx.replyWithMarkdown(`
👋 *Selamat datang di Bot Anti-Link!*
Bot ini akan *menghapus semua pesan berisi link* (.com, .id, .xyz, dll).

Ketik /help untuk melihat perintah yang tersedia.
  `);
});

// /help
bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(`
📌 *Perintah Tersedia:*
/izinkan — Aktifkan bot di grup ini
/wl @username — Tambahkan whitelist user
/unwl @username — Hapus user dari whitelist
/help — Tampilkan perintah ini
  `);
});

// /izinkan
bot.command('izinkan', (ctx) => {
  const chatId = ctx.chat.id;
  if (!allowedGroups.includes(chatId)) {
    allowedGroups.push(chatId);
    ctx.reply('✅ Bot telah diaktifkan untuk grup ini.');
  } else {
    ctx.reply('ℹ️ Grup ini sudah diizinkan.');
  }
});

// /wl
bot.command('wl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username || !username.startsWith('@')) {
    return ctx.reply('❌ Format salah. Gunakan: /wl @username');
  }
  if (!whitelist.includes(username)) {
    whitelist.push(username);
    ctx.reply(`✅ ${username} telah ditambahkan ke whitelist.`);
  } else {
    ctx.reply(`ℹ️ ${username} sudah ada di whitelist.`);
  }
});

// /unwl
bot.command('unwl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username || !username.startsWith('@')) {
    return ctx.reply('❌ Format salah. Gunakan: /unwl @username');
  }
  const index = whitelist.indexOf(username);
  if (index !== -1) {
    whitelist.splice(index, 1);
    ctx.reply(`🗑️ ${username} telah dihapus dari whitelist.`);
  } else {
    ctx.reply(`⚠️ ${username} tidak ditemukan dalam whitelist.`);
  }
});

// Listener untuk semua pesan
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const from = ctx.from;
  const text = ctx.message?.text || ctx.message?.caption || '';
  const fromUsername = from.username ? `@${from.username}` : from.first_name;

  if (!allowedGroups.includes(chatId)) return;

  const isWhitelisted = from.username && whitelist.includes(`@${from.username}`);
  const hasLink = linkRegex.test(text);

  if (hasLink && !isWhitelisted) {
    try {
      await ctx.deleteMessage();
      await ctx.replyWithMarkdown(`🚫 *Pesan dari ${fromUsername} dihapus karena mengandung link.*`);
      console.log(`[TERHAPUS] ${fromUsername}: ${text}`);
    } catch (err) {
      console.error('❗ Gagal hapus pesan:', err.message);
    }
  }
});

bot.launch();
console.log('🤖 Bot Anti-Link aktif dan siap menjaga grupmu!');
