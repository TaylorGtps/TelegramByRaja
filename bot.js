const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

// Ganti token ini dengan milik kamu
const bot = new Telegraf('7991511524:AAE1ReD73oQ7p8MRhLtj8UQZf8FxTA1OeG0');

// File untuk data konfigurasi
const dataPath = path.join(__dirname, 'data.json');

// Muat data atau buat default
let data = {
  allowedGroups: [],
  whitelist: [],
  blockedDomains: ['t.me', 'bit.ly']
};

if (fs.existsSync(dataPath)) {
  data = JSON.parse(fs.readFileSync(dataPath));
}

function saveData() {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Regex deteksi link
const linkRegex = /(?:https?:\/\/)?(?:www\.)?[^\s]+\.[^\s]+/i;

bot.start((ctx) => {
  ctx.reply('✅ Bot Anti-Link aktif dan akan memberi notifikasi saat menghapus pesan.');
});

// Perintah izinkan grup
bot.command('izinkan', (ctx) => {
  const chatId = ctx.chat.id;
  if (!data.allowedGroups.includes(chatId)) {
    data.allowedGroups.push(chatId);
    saveData();
    ctx.reply('✅ Grup ini sekarang menggunakan sistem anti-link.');
  } else {
    ctx.reply('ℹ️ Grup ini sudah aktif anti-link.');
  }
});

// Perintah whitelist
bot.command('wl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('⚠️ Format: /wl @username');
  if (!data.whitelist.includes(username)) {
    data.whitelist.push(username);
    saveData();
    ctx.reply(`✅ ${username} ditambahkan ke whitelist.`);
  } else {
    ctx.reply('ℹ️ Username sudah di whitelist.');
  }
});

// Un-whitelist
bot.command('unwl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('⚠️ Format: /unwl @username');
  data.whitelist = data.whitelist.filter(u => u !== username);
  saveData();
  ctx.reply(`❌ ${username} dihapus dari whitelist.`);
});

// Tambahkan domain blok
bot.command('setdomain', (ctx) => {
  const domain = ctx.message.text.split(' ')[1];
  if (!domain) return ctx.reply('⚠️ Format: /setdomain domain.com');
  if (!data.blockedDomains.includes(domain)) {
    data.blockedDomains.push(domain);
    saveData();
    ctx.reply(`✅ Domain ${domain} ditambahkan ke daftar blokir.`);
  } else {
    ctx.reply('ℹ️ Domain sudah ada dalam daftar blokir.');
  }
});

// Deteksi dan hapus pesan link
bot.on('message', async (ctx) => {
  const chatId = ctx.chat.id;
  if (!data.allowedGroups.includes(chatId)) return;

  const fromUsername = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
  const isWhitelisted = data.whitelist.includes(`@${ctx.from.username}`);
  const text = ctx.message.text || ctx.message.caption || '';

  const domainMatch = data.blockedDomains.some(d => text.includes(d));
  if ((domainMatch || linkRegex.test(text)) && !isWhitelisted) {
    try {
      await ctx.deleteMessage();

      // Kirim notifikasi ke grup
      await ctx.reply(`❌ Pesan dari ${fromUsername} telah dihapus karena mengandung link.`);

      // Log ke file
      fs.appendFileSync(
        'link-log.txt',
        `[${new Date().toLocaleString()}] ${fromUsername} dihapus di ${ctx.chat.title}: ${text}\n`
      );
    } catch (err) {
      console.error('❗ Gagal menghapus pesan:', err.message);
    }
  }
});

bot.launch();
console.log('🤖 Bot Anti-Link berjalan dan notifikasi ON secara default!');