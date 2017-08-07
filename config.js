const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '/.env'),   // You should create .env file in project root directory. See .env_example
});

module.exports = {
  telegramKey: process.env.TELEGRAM_KEY,
  bitfinexKey: process.env.BITFINEX_KEY,
  bitfinexSecret: process.env.BITFINEX_SECRET,
};