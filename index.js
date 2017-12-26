const fs = require('fs');
const { exec, spawnSync } = require('child_process');
const request = require('request');
const PubNub = require('pubnub');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const initImageFilename = 'init.ppm';

let queue = [];

async function run(config) {
  const { logo, initMessage, ledMatrix, pubnub } = config;
  generateTextImage({
    text: initMessage,
    filename: initImageFilename,
    ledRows: ledMatrix.options.ledRows
  });

  const cmdDisplayLogo = `sudo ${ledMatrix.path}/utils/led-image-viewer ${logo} -w2 ./${initImageFilename} -w2 -C ${buildLedMatrixOptions(ledMatrix.options)}`;
  await execCommand(cmdDisplayLogo);

  const pubNub = new PubNub({
    subscribeKey: pubnub.subscribeKey,
    secretKey: pubnub.secretKey,
    ssl: true
  });

  pubNub.subscribe({
    channels: pubnub.channels
  });

  pubNub.addListener({
    status: (statusEvent) => {
      if (statusEvent.category === "PNConnectedCategory") {
        console.log('PubNub', 'connected')
      } else if (statusEvent.category === "PNUnknownCategory") {
        const newState = { new: 'error' };
        pubNub.setState({ state: newState }, (status) => { console.log('PubNub', statusEvent.errorData.message) });
      }
    },
    message: async (msg) => {
      console.log('PubNub', msg);
      queue.push(msg);
      await sendToDisplayPanel({
        message: msg,
        imageFile: `${msg.userMetadata.name}.ppm`,
        ledMatrix
      });
    }
  });
}

run(config).then(() => console.log('Cactus Pi Client Started!'));

async function execCommand(cmd) {
  const { error, stderr } = await exec(cmd);
  if (error) {
    console.error('error', error);
    console.error('stderr:', stderr);
    return false;
  }
  return true;
}

async function sendToDisplayPanel({ message, imageFile, ledMatrix }) {
  generateTextImage({
    text: message.message,
    filename: imageFile,
    ledRows: ledMatrix.options.ledRows
  });

  const { duration } = message.userMetadata;
  const cmdDisplayMessage = `sudo ${ledMatrix.path}/examples-api-use/demo --led-rows=32 --led-chain=2 -t ${duration} -m 25 -D 1 ./${imageFile} ${buildLedMatrixOptions(ledMatrix.options)}`;
  await execCommand(cmdDisplayMessage);
}

function generateTextImage({ text, filename, ledRows}) {
  const args = ["./generate-image.py", text, filename, ledRows];
  return spawnSync('python', args);
}

function buildLedMatrixOptions(options) {
  return `--led-rows=${options.ledRows} --led-chain=${options.ledChain} ${options.ledNoHardwarePulse ? '--led-no-hardware-pulse' : ''} --led-gpio-mapping=${options.ledGpioMapping}`;
}
