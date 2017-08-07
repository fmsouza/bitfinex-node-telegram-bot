/** Dependencies */
const Bitfinex = require('bitfinex');
const TelegramBot = require('node-telegram-bot-api');

const config = require('./config'); // contain keys

/** Setup modules */
const telegramToken = config.telegramKey;
const bot = new TelegramBot(telegramToken, {polling: true});
const myBitfinex = new Bitfinex(config.bitfinexKey, config.bitfinexSecret);


/** Handle /menu command */
bot.onText(/\/menu/, function(msg) {
  const opts = {
  reply_markup: {
    keyboard: [
        [{
              text: 'btcusd'
              },
              {
              text: 'ethusd'
              },
              {
              text: 'ltcusd'
              }
        ],
        [
            {
              text: 'balance'
            }
        ],
    ],
    resize_keyboard: false,
    one_time_keyboard: false
  }
  };
  bot.sendMessage(msg.from.id, 'Menu', opts);
});

/** Handle 'balance' command */
bot.onText(/balance/, function(msg) {
  const id = msg.from.id;
  const answer = 'If you want to check your wallet balance just send me your api key and api secret from bitfinex.com separated by a comma without spaces.\n\ni.e.:\nkeeeeeeeeeeeeeeeyyyyyy,seeeeeeeeeeecrettt';
  bot.sendMessage(id, answer);
});


/** Checking ticker of btcusd, ethusd and ltcusd */
bot.on('message', function(msg) {
  if(msg.text.length == 6) {
    const id = msg.from.id;

    myBitfinex.ticker(msg.text, function(err, res) {
        if(err == null) {
            var answer = '';
            answer += 'Mid: ' + res.mid + '\n';
            answer += 'Bid: ' + res.bid + '\n';
            answer += 'Ask: ' + res.ask + '\n';
            answer += 'Last price: ' + res.last_price + '\n';
            answer += 'Low: ' + res.low + '\n';
            answer += 'High: ' + res.high + '\n';

            bot.sendMessage(id, answer);
        } else if(err != null) {
            bot.sendMessage(id, err.message);
        } else {
            bot.sendMessage(id, 'Unknown error');
        }
    })
  }
});



/** Getting current balances of all user's deposits  */
bot.on('message', function(msg) {
  const id = msg.chat.id;
  const str = msg.text;
  const key = str.search(/,/i);                   // Because we asked user to send us api key and secret, separated by a comma and without spaces
  if (key != -1) {                                // If comma not found str.search() returns -1
    var api_key = str.slice(0, key);               // First half of message
    var secret_key = str.slice(key+1);             // Second one
    if (api_key.length > 10 && secret_key.length > 10) {
      const bitfinex = new Bitfinex(api_key, secret_key);
      bitfinex.wallet_balances(function(err, res) {
        if (err == null) {
          if (res[0] == undefined) {
            bot.sendMessage(id, 'Wallet is empty');
          } else {
            var messageText = '==============\n';
            for (var i = 0; i <= res.length -1; i++) {             // For each currency
              messageText += 'Currency: ' + res[i].currency + '\n';
              messageText += 'Amount: ' + res[i].amount + '\n';
              messageText += 'Available: ' + res[i].available + '\n';
              messageText += '------------------------\n';
            };
          bot.sendMessage(id, messageText);
          };
        } else {
          bot.sendMessage(id, `Error: ${err.message}`); // If you will try to send incorrect apikey or secret - bitfinex server will responds `Error: 401`. 
        };
      });
    } else {
      bot.sendMessage(id, 'Wrong api key or secret key');
    };
  };
});

