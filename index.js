const fs = require('fs');
const { exec, spawnSync } = require('child_process');
const request = require('request');
const PubNub = require('pubnub');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const initImageFilename = 'init.ppm';
const messageImageFilename = 'temperature.ppm';

async function run(config) {
  const { logo, initMessage, ledMatrix, pubnub } = config;
  generateTextImage({
    text: initMessage,
    filename: initImageFilename,
    ledRows: ledMatrix.options.ledRows
  });

  const cmdDisplayLogo = `sudo ${ledMatrix.path}/utils/led-image-viewer ${logo} -w2 ./${initImageFilename} -w2 -C ${buildLedMatrixOptions(ledMatrix.options)}`;
  
  const pubNub = new PubNub({
    subscribeKey: pubnub.subscribeKey,
    secretKey: pubnub.secretKey,
    ssl: true
  });
  
  pubNub.subscribe({
    channels: pubnub.channels
  });
  
  pubNub.addListener({
    status: function(statusEvent) {
      if (statusEvent.category === "PNConnectedCategory") {
        console.log('PubNub', 'connected')
      } else if (statusEvent.category === "PNUnknownCategory") {
        const newState = { new: 'error' };
        pubNub.setState({ state: newState }, (status) => { console.log('PubNub', statusEvent.errorData.message) });
      } 
    },
    message: function(message) {
      console.log('PubNub', message);

      generateTextImage({
        text: message.display,
        filename: messageImageFilename,
        ledRows: ledMatrix.options.ledRows
      });
    
      const cmdDisplayWeather = `sudo ${ledMatrix.path}/examples-api-use/demo --led-rows=32 --led-chain=2 -t 300 -m 25 -D 1 ./${messageImageFilename} ${buildLedMatrixOptions(ledMatrix.options)}`;
      exec(`${cmdDisplayLogo} && ${cmdDisplayWeather}`, puts);
    }
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
