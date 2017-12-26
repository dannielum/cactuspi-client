const fs = require('fs');
const { exec, spawnSync } = require('child_process');
const PubNub = require('pubnub');
const queue = require('queue');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const initImageFilename = 'init.ppm';

let q = queue();
q.autostart = true;
q.concurrency = 1;

run(config).then(() => console.log('Cactus Pi Client Started!'));

async function run(config) {
  const { logo, initMessage, ledMatrix, pubnub } = config;
  generateTextImage({
    text: initMessage,
    filename: initImageFilename,
    ledRows: ledMatrix.options.ledRows
  });

  const cmdDisplayLogo = `sudo ${ledMatrix.path}/utils/led-image-viewer ${logo} -w2 ./${initImageFilename} -w2 -C ${buildLedMatrixOptions(ledMatrix.options)}`;
  execCommand(cmdDisplayLogo);

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
    message: (msg) => {
      // console.log('PubNub', msg);
      q.push((cb) => {
        return new Promise((resolve, reject) => {
          sendToDisplayPanel({
            message: msg,
            imageFile: `${msg.userMetadata.name}.ppm`,
            ledMatrix
          }).then(res => {
            console.log('res', res);
            resolve(res);
          }).catch(err => {
            console.log('err', err);
            reject(err);
          });
        });
      });
    }
  });

  q.on('success', function (result, job) {
    console.log('job finished processing:', job.toString().replace(/\n/g, ''));
  })
  
  q.start((err) => console.log('queue ended', err));
}

function execCommand(cmd) {
  return new Promise((resolve) => {
    const child = exec(cmd);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', () => {
      resolve();
    });
  });
}

async function sendToDisplayPanel({ message, imageFile, ledMatrix }) {
  generateTextImage({
    text: message.message,
    filename: imageFile,
    ledRows: ledMatrix.options.ledRows
  });

  const { duration } = message.userMetadata;
  const cmdDisplayMessage = `sudo ${ledMatrix.path}/examples-api-use/demo --led-rows=32 --led-chain=2 -t ${duration} -m 25 -D 1 ./${imageFile} ${buildLedMatrixOptions(ledMatrix.options)}`;
  return await execCommand(cmdDisplayMessage);
}

function generateTextImage({ text, filename, ledRows}) {
  const args = ["./generate-image.py", text, filename, ledRows];
  return spawnSync('python', args);
}

function buildLedMatrixOptions(options) {
  return `--led-rows=${options.ledRows} --led-chain=${options.ledChain} ${options.ledNoHardwarePulse ? '--led-no-hardware-pulse' : ''} --led-gpio-mapping=${options.ledGpioMapping}`;
}
