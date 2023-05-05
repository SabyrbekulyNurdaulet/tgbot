const { Telegraf } = require('telegraf');
const Extra = require('telegraf/extra');
const fetch = require('isomorphic-fetch');

const bot = new Telegraf('6220051872:AAHGn0UCvZOWb4jgyEKunWWk92Ch72cm3cI');
const mapboxApiKey = 'pk.eyJ1Ijoic2VlbmRkIiwiYSI6ImNsaDAzbjNmMTBxMTAzbHF4OWRrdTVibWoifQ.9RFA63G3DYxvc_DZZpaMug';

async function getCityInfo(cityName) {
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${mapboxApiKey}`);
  const data = await response.json();

  if (!data || !data.features || !data.features.length) {
    return null;
  }

  const city = data.features[0];

  return {
    name: city.text,
    regionName: city.context ? city.context.map(c => c.text).join(', ') : '',
    countryName: city.properties ? city.properties.short_code : '',
    population: null,
    timezone: null,
    latitude: city.center[1],
    longitude: city.center[0]
  };
}

function getRecommendations(cityInfo) {
  return 'Воздух в этом городе очень грязный ';
}

bot.start((ctx) => {
  ctx.reply('Привет! Я бот, который поможет тебе узнать больше о местности, в которой ты находишься. Напиши мне название города, чтобы начать!');
});

bot.hears(/^[a-zA-Zа-яА-Я\s]+$/, async (ctx) => {
  const cityName = ctx.message.text;
  const cityInfo = await getCityInfo(cityName);

  if (!cityInfo) {
    ctx.reply('К сожалению, я не смог найти информацию об этом городе. Попробуй ввести название еще раз.');
    return;
  }

  const message = `${cityInfo.name}, ${cityInfo.regionName}, ${cityInfo.countryName}\n\n` +
    `Население: 1,777 миллиона\n` +
    //${cityInfo.population}\n
    `Часовой пояс: (GMT+6)\n` + 
    //${cityInfo.timezone}\n
    'Oтели поблизости: null \n' +
    `Широта: ${cityInfo.latitude}, Долгота: ${cityInfo.longitude}\n\n` +
    `Рекомендации: Медеу `;
    //${getRecommendations(cityInfo)}

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+e74c3c(${cityInfo.longitude},${cityInfo.latitude})/${cityInfo.longitude},${cityInfo.latitude},12,0/500x300?access_token=${mapboxApiKey}`;
  const mapExtra = Extra.markup((m) => {
    return m.inlineKeyboard([
      m.urlButton('Показать на карте', mapUrl)
    ]);
  });

  ctx.reply(message, mapExtra);
});

bot.launch();
