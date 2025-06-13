const { Telegraf } = require('telegraf');

// Ganti dengan token milik kamu
const bot = new Telegraf('7991511524:AAE1ReD73oQ7p8MRhLtj8UQZf8FxTA1OeG0');

// Data disimpan dalam kode (tanpa file)
const data = {
  allowedGroups: [],
  whitelist: [],
  blockedDomains: ['t.me', 'bit.ly', 'tinyurl.com', 'discord.gg'],
};

// Regex deteksi link umum
const linkRegex = /(?:https?:\/\/)?(?:www\.)?[^\s]+\.[^\s]+/i;

// ✅ Command: /start
bot.start((ctx) => {
  ctx.replyWithMarkdown(`
*👋 Selamat datang di Bot Anti-Link!*

🔐 Bot ini akan *menghapus pesan yang berisi link* dari pengguna yang tidak di-whitelist.
Gunakan /help untuk melihat semua perintah.
`);
});

// ✅ Command: /help
bot.command('help', (ctx) => {
  ctx.replyWithMarkdown(`
*📖 Daftar Perintah Bot Anti-Link:*

/izinkan — Izinkan grup ini pakai bot anti-link
/wl @username — Tambah user ke whitelist
/unwl @username — Hapus user dari whitelist
/setdomain domain.com — Tambah domain ke daftar blokir
/help — Lihat daftar perintah

⚠️ Semua pesan link akan langsung dihapus kecuali dari user whitelist.
`);
});

// ✅ Command: /izinkan
bot.command('izinkan', (ctx) => {
  const chatId = ctx.chat.id;
  if (!data.allowedGroups.includes(chatId)) {
    data.allowedGroups.push(chatId);
    ctx.reply('✅ Grup ini sekarang menggunakan sistem Anti-Link.');
  } else {
    ctx.reply('ℹ️ Grup ini sudah diizinkan sebelumnya.');
  }
});

// ✅ Command: /wl
bot.command('wl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username || !username.startsWith('@')) {
    return ctx.reply('❌ Format salah.\nContoh: /wl @namapengguna');
  }
  if (!data.whitelist.includes(username)) {
    data.whitelist.push(username);
    ctx.reply(`✅ ${username} telah ditambahkan ke whitelist.`);
  } else {
    ctx.reply(`ℹ️ ${username} sudah ada di whitelist.`);
  }
});

// ✅ Command: /unwl
bot.command('unwl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username || !username.startsWith('@')) {
    return ctx.reply('❌ Format salah.\nContoh: /unwl @namapengguna');
  }
  data.whitelist = data.whitelist.filter(u => u !== username);
  ctx.reply(`🗑️ ${username} telah dihapus dari whitelist.`);
});

// ✅ Command: /setdomain
bot.command('setdomain', (ctx) => {
  const domain = ctx.message.text.split(' ')[1];
  if (!domain) return ctx.reply('❌ Format salah.\nContoh: /setdomain domain.com');
  if (!data.blockedDomains.includes(domain)) {
    data.blockedDomains.push(domain);
    ctx.reply(`✅ Domain ${domain} telah ditambahkan ke daftar blokir.`);
  } else {
    ctx.reply(`ℹ️ Domain ${domain} sudah diblokir.`);
  }
});

// 🔍 Cek semua pesan
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text || ctx.message.caption || '';
  const from = ctx.from;
  const fromUsername = from.username ? `@${from.username}` : from.first_name;

  // Hanya tangani grup yang sudah diizinkan
  if (!data.allowedGroups.includes(chatId)) return;

  const isWhitelisted = from.username && data.whitelist.includes(`@${from.username}`);
  const containsBlockedDomain = data.blockedDomains.some(domain => text.includes(domain));
  const hasAnyLink = linkRegex.test(text);

  if ((containsBlockedDomain || hasAnyLink) && !isWhitelisted) {
    try {
      await ctx.deleteMessage();
      await ctx.replyWithMarkdown(`🚫 Pesan dari *${fromUsername}* dihapus karena mengandung link.`);
      console.log(`[DELETED] ${fromUsername}: ${text}`);
    } catch (err) {
      console.error('❗ Gagal hapus pesan:', err.message);
    }
  }
});

bot.launch();
console.log('✅ Bot Anti-Link aktif sepenuhnya!');
