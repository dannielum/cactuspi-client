const fs = require('fs');
const text2png = require('text2png');
const exec = require('child_process').exec;
const request = require('request');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);

function puts(error, stdout, stderr) {
  if (error) {
    console.error('error', error);
  }
  console.log(stdout);
}

function buildLedMatrixOptions(options) {
  return `--led-rows=${options.ledRows} --led-chain=${options.ledChain} ${options.ledNoHardwarePulse ? '--led-no-hardware-pulse' : ''} --led-gpio-mapping=${options.ledGpioMapping}`;
}

const { logo, ledMatrix, weather } = config;

fs.writeFileSync(
  'init.png',
  text2png(config.initMessage, {
    font: '180px sans-serif',
    textColor: 'green',
    lineSpacing: 10,
    padding: 20,
    output: 'buffer'
  })
);

const cmdDisplayLogo = `sudo ${ledMatrix.path}/led-image-viewer ${logo} -w2 ./init.png -w2 -C ${buildLedMatrixOptions(ledMatrix.options)}`;
exec(cmdDisplayLogo, puts);

// console.log(cmdDisplayLogo);
// runCommand(`sudo ./demo --led-rows=32 --led-chain=2 -t 60 -m 25 -D 1 "+disp+" --led-no-hardware-pulse --led-gpio-mapping=adafruit-hat`, 2000);

const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?zip=${weather.city}&units=${weather.unit}&appid=${weather.openWeatherMapApi}`

request(weatherUrl, (err, response, body) => {
  if (err) {
    console.error('weather', err);
    return;
  }
  
  const result = JSON.parse(body);
  if (result.main === undefined){
    console.error('weather', 'failed to get weather data, please try again.');
    return;
  }
  
  let unit = 'K';
  if (weather.unit === 'metric') {
    unit = 'C';
  } else if (weather.unit === 'imperial') {
    unit = 'F';
  }
  const weatherText = `${Math.round(result.main.temp)}°${unit}`;
  console.log('weather', weatherText);
  
  fs.writeFileSync(
    'temperature.png',
    text2png(weatherText, {
      font: '180px sans-serif',
      textColor: 'blue',
      lineSpacing: 10,
      padding: 20,
      output: 'buffer'
    })
  );

  const cmdDisplayWeather = `sudo ${ledMatrix.path}/led-image-viewer ./temperature.png -C ${buildLedMatrixOptions(ledMatrix.options)}`;
  exec(cmdDisplayWeather, puts);
});
