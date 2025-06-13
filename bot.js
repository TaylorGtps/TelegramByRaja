const { Telegraf } = require('telegraf');

// Ganti token dengan token milik kamu
const bot = new Telegraf('7991511524:AAE1ReD73oQ7p8MRhLtj8UQZf8FxTA1OeG0');

// Data disimpan langsung di dalam kode (RAM)
const data = {
  allowedGroups: [],
  whitelist: [],
  blockedDomains: ['t.me', 'bit.ly', 'tinyurl.com', 'discord.gg'],
};

// Deteksi link
const linkRegex = /(?:https?:\/\/)?(?:www\.)?[^\s]+\.[^\s]+/i;

// Perintah awal
bot.start((ctx) => {
  ctx.reply('✅ Bot Anti-Link aktif.\nPesan berisi link akan otomatis dihapus dan diberi notifikasi.');
});

// Perintah izinkan grup
bot.command('izinkan', (ctx) => {
  const chatId = ctx.chat.id;
  if (!data.allowedGroups.includes(chatId)) {
    data.allowedGroups.push(chatId);
    ctx.reply('✅ Grup ini sekarang menggunakan sistem anti-link.');
  } else {
    ctx.reply('ℹ️ Grup ini sudah diizinkan.');
  }
});

// Tambah ke whitelist user
bot.command('wl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('⚠️ Format: /wl @username');
  if (!data.whitelist.includes(username)) {
    data.whitelist.push(username);
    ctx.reply(`✅ ${username} ditambahkan ke whitelist.`);
  } else {
    ctx.reply('ℹ️ Sudah di-whitelist.');
  }
});

// Hapus dari whitelist
bot.command('unwl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('⚠️ Format: /unwl @username');
  data.whitelist = data.whitelist.filter(u => u !== username);
  ctx.reply(`❌ ${username} dihapus dari whitelist.`);
});

// Tambah domain terblokir
bot.command('setdomain', (ctx) => {
  const domain = ctx.message.text.split(' ')[1];
  if (!domain) return ctx.reply('⚠️ Format: /setdomain domain.com');
  if (!data.blockedDomains.includes(domain)) {
    data.blockedDomains.push(domain);
    ctx.reply(`✅ Domain ${domain} ditambahkan ke blok list.`);
  } else {
    ctx.reply('ℹ️ Domain sudah diblok.');
  }
});

// Deteksi pesan
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text || ctx.message.caption || '';
  const fromUsername = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

  if (!data.allowedGroups.includes(chatId)) return;

  const isWhitelisted = data.whitelist.includes(`@${ctx.from.username}`);
  const domainDetected = data.blockedDomains.some(domain => text.includes(domain));

  if ((domainDetected || linkRegex.test(text)) && !isWhitelisted) {
    try {
      await ctx.deleteMessage();
      await ctx.reply(`❌ Pesan dari ${fromUsername} telah dihapus karena mengandung link.`);
      console.log(`[LOG] ${fromUsername}: ${text}`);
    } catch (err) {
      console.error('❗ Gagal hapus pesan:', err.message);
    }
  }
});

bot.launch();
console.log('🤖 Bot Anti-Link aktif sepenuhnya di mode notif!');
