const { Telegraf } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf('7991511524:AAE1ReD73oQ7p8MRhLtj8UQZf8FxTA1OeG0');

// Load data file
let data = { allowedGroups: [], whitelist: [], domains: [], antiLink: false };

if (fs.existsSync('data.json')) {
  data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
}

// Save data function
const saveData = () => fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

// /start
bot.start((ctx) => {
  ctx.reply('🤖 Bot Anti-Link aktif!\nGunakan /antilink on/off\nGunakan /izinkan di grup target');
});

// /antilink on|off
bot.command('antilink', (ctx) => {
  const arg = ctx.message.text.split(' ')[1];
  if (arg === 'on') {
    data.antiLink = true;
    saveData();
    ctx.reply('✅ Anti-Link diaktifkan.');
  } else if (arg === 'off') {
    data.antiLink = false;
    saveData();
    ctx.reply('❌ Anti-Link dimatikan.');
  } else {
    ctx.reply('Format: /antilink on atau /antilink off');
  }
});

// /izinkan
bot.command('izinkan', (ctx) => {
  const chatId = ctx.chat.id;
  if (!data.allowedGroups.includes(chatId)) {
    data.allowedGroups.push(chatId);
    saveData();
    ctx.reply('✅ Grup ini sekarang diizinkan memakai Anti-Link.');
  } else {
    ctx.reply('✅ Grup ini sudah diizinkan sebelumnya.');
  }
});

// /wl @username
bot.command('wl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('Format: /wl @username');
  if (!data.whitelist.includes(username)) {
    data.whitelist.push(username);
    saveData();
    ctx.reply(`✅ ${username} telah di-whitelist.`);
  } else {
    ctx.reply(`ℹ️ ${username} sudah ada di whitelist.`);
  }
});

// /unwl @username
bot.command('unwl', (ctx) => {
  const username = ctx.message.text.split(' ')[1];
  if (!username) return ctx.reply('Format: /unwl @username');
  data.whitelist = data.whitelist.filter(u => u !== username);
  saveData();
  ctx.reply(`❌ ${username} dihapus dari whitelist.`);
});

// /setdomain
bot.command('setdomain', (ctx) => {
  const domains = ctx.message.text.split(' ').slice(1);
  if (domains.length === 0) return ctx.reply('Format: /setdomain domain1.com domain2.com');
  data.domains = domains;
  saveData();
  ctx.reply(`🌐 Domain yang akan diblokir:\n${domains.join('\n')}`);
});

// Anti-link handler
bot.on('message', async (ctx) => {
  if (!data.antiLink) return;
  if (!data.allowedGroups.includes(ctx.chat.id)) return;

  const fromUsername = ctx.from.username ? '@' + ctx.from.username : ctx.from.first_name;
  const isWhitelisted = data.whitelist.includes('@' + ctx.from.username);
  const text = ctx.message.text || '';

  // Cek link
  const domainMatch = data.domains.some(domain => text.includes(domain));
  const linkRegex = /(https?:\/\/|t\.me\/|telegram\.me\/|www\.)\S+/i;

  if ((domainMatch || linkRegex.test(text)) && !isWhitelisted) {
    try {
      await ctx.deleteMessage();
      fs.appendFileSync('link-log.txt', `[${new Date().toLocaleString()}] ${fromUsername}: ${text}\n`);
      console.log(`❌ Dihapus: ${fromUsername}`);
    } catch (err) {
      console.error('⚠️ Gagal hapus:', err.message);
    }
  }
});

// Run bot
bot.launch().then(() => {
  console.log('🚀 Bot Anti-Link Pro Siap Tempur!');
});