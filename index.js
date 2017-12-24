const fs = require('fs');
const { exec, spawnSync } = require('child_process');
const request = require('request');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const initImageFilename = 'init.ppm';
const messageImageFilename = 'temperature.ppm';

async function run(config) {
  const { logo, initMessage, ledMatrix, weather } = config;
  generateTextImage({
    text: initMessage,
    filename: initImageFilename,
    ledRows: ledMatrix.options.ledRows
  });

  const cmdDisplayLogo = `sudo ${ledMatrix.path}/utils/led-image-viewer ${logo} -w2 ./${initImageFilename} -w2 -C ${buildLedMatrixOptions(ledMatrix.options)}`;

  const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?zip=${weather.city}&units=${weather.unit}&appid=${weather.openWeatherMapApi}`;
  
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
    const temperature = `Now: ${Math.round(result.main.temp)}'${unit}. Today ${Math.round(result.main.temp_min)}'${unit} - ${Math.round(result.main.temp_max)}'${unit}.`;
    const condition = `Forecast: ${result.weather[0].description}. Humidity: ${result.main.humidity}%.`;
    const message = `${result.name} - ${temperature} ${condition}`;

    generateTextImage({
      text: message,
      filename: messageImageFilename,
      ledRows: ledMatrix.options.ledRows
    });
  
    const cmdDisplayWeather = `sudo ${ledMatrix.path}/examples-api-use/demo --led-rows=32 --led-chain=2 -t 300 -m 25 -D 1 ./${messageImageFilename} ${buildLedMatrixOptions(ledMatrix.options)}`;
    exec(`${cmdDisplayLogo} && ${cmdDisplayWeather}`, puts);
  });
}

run(config).then(() => console.log('Done!'));

function puts(error, stdout, stderr) {
  if (error) {
    console.error('error', error);
  }
  console.log(stdout);
}

function generateTextImage({ text, filename, ledRows}) {
  const args = ["./generate-image.py", text, filename, ledRows];
  return spawnSync('python', args);
}

function buildLedMatrixOptions(options) {
  return `--led-rows=${options.ledRows} --led-chain=${options.ledChain} ${options.ledNoHardwarePulse ? '--led-no-hardware-pulse' : ''} --led-gpio-mapping=${options.ledGpioMapping}`;
}
