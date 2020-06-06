const BOT_TOKEN = process.env.BOT_TOKEN;

const Telegraf = require('telegraf');
const { Router, Markup } = Telegraf;
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const fs = require('fs');

const picture = fs.readFileSync('pic.jpg');
const presentation = fs.readFileSync('Presentation.pdf');

const bot = new Telegraf(BOT_TOKEN);


const createScene = new WizardScene('create',
(ctx)=>{
  ctx.reply('1. Введите количество тестов:');
  return ctx.wizard.next();
},
(ctx)=>{
  ctx.wizard.state.quantity = parseInt(ctx.message.text, 10);
  ctx.reply('2. Введите телефон:');
  return ctx.wizard.next();
},
(ctx)=>{
  ctx.wizard.state.phone = ctx.message.text;
  ctx.reply('3. Введите адрес доставки:');
  return ctx.wizard.next();
},
(ctx)=>{
  ctx.wizard.state.adress = ctx.message.text;
  const quantity = ctx.wizard.state.quantity;
  const phone = ctx.wizard.state.phone;
  const adress = ctx.wizard.state.adress;

  ctx.reply(`Привезём ${quantity} тестов на адрес ${adress}. Телефон: ${phone}`);
  return ctx.scene.leave();
}
);

const inlineMessageRatingKeyboard = Markup.inlineKeyboard([
    Markup.callbackButton('Заказать', 'order'),
    Markup.callbackButton('Презентация PDF', 'presentation')
]).extra()
inlineMessageRatingKeyboard.caption = 'Бот для заказа COVID тестов (тут сразу описать что к чему, без входа в меню)';

const stage = new Stage();
stage.register(createScene);

bot.use(session());
bot.use(stage.middleware());

// bot.start((ctx)=>ctx.scene.enter('create'));

// bot.on('message', (ctx) => ctx.replyWithPhoto({ source: fs.createReadStream('pic.jpg') }, inlineMessageRatingKeyboard));

bot.on('message', (ctx) => ctx.replyWithPhoto({ source: picture }, inlineMessageRatingKeyboard));

// bot.on('message', (ctx) => ctx.telegram.sendMessage(
//     ctx.from.id,
//     'Бот для заказа COVID тестов (тут сразу описать что к чему, без входа в меню)',
//     inlineMessageRatingKeyboard)
// )

bot.action('order', (ctx) => ctx.scene.enter('create'));
bot.action('presentation', (ctx) => {
	return ctx.telegram.sendDocument(ctx.from.id, {source: presentation, filename: 'Presentation.pdf', {caption: 'TEST'});
	// return ctx.editMessageText('Тут будет файл с презентацией. Нажмите /start, чтобы вернуться к заказу');
});

bot.launch().
then(res=>console.log('Started'))
.catch(err=>console.log(err));
