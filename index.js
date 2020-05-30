const fs = require('fs');
const { exec, spawnSync } = require('child_process');
const queue = require('queue');
const PubSubService = require('./services');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);
const initImageFilename = 'init.ppm';
const { logo, initMessage, ledMatrix } = config;

const ledOptions = buildLedMatrixOptions(ledMatrix.options);

let q = queue();
q.autostart = true;
q.concurrency = 1;

let repeatMessage;

run().then(() => {
  console.log('Cactus Pi Client Started!');
});

async function run() {
  generateTextImage({
    text: initMessage,
    filename: initImageFilename,
    ledRows: ledMatrix.options.ledRows,
  });

  const cmdDisplayLogo = `sudo ${ledMatrix.path}/utils/led-image-viewer ${logo} -w2 ./${initImageFilename} -w2 -C ${ledOptions}`;
  q.push(() =>
    execCommand({
      cmd: cmdDisplayLogo,
      ledMatrix,
    })
  );

  const pubsubService = new PubSubService(config);

  pubsubService.subscribe(sendMessage, sendCommand);

  q.on('success', (message, job) => {
    console.log('job finished processing', message);
    if (!message) {
      displayTime(ledMatrix);
      return;
    }

    const { repeat } = message.userMetadata;
    if (repeat) {
      repeatMessage = message;
    }

    loopMessage();
  });

  q.on('error', (error, job) => {
    console.error('job failed to execute', error);
  });

  q.start((err) => console.log('queue ended', err));
}

function sendCommand(command) {
  console.log('command', command);
  switch (command) {
    case 'start':
      q.start((err) => console.log('queue ended', err));
      break;
    case 'stop':
      q.stop();
      break;
    case 'end':
      q.end();
      break;
    case 'clear':
      q.splice(0);
      break;
  }
}

function sendMessage(message) {
  q[msg.userMetadata.priority ? 'unshift' : 'push'](() => {
    return new Promise((resolve) => {
      sendToDisplayPanel({
        message,
        imageFile: `${message.userMetadata.name}.ppm`,
        ledMatrix,
      })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  });
}

function loopMessage() {
  if (q.length !== 0) {
    return;
  }

  if (repeatMessage) {
    q.push((cb) => {
      return new Promise((resolve, reject) => {
        sendToDisplayPanel({
          message: repeatMessage,
          imageFile: `${repeatMessage.userMetadata.name}.ppm`,
          ledMatrix,
        })
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            resolve(err);
          });
      });
    });
  } else {
    displayTime(ledMatrix);
  }
}

function execCommand({ cmd, message, ledMatrix }) {
  killProcess(`${ledMatrix.path}/examples-api-use/clock`);

  return new Promise((resolve, reject) => {
    const child = exec(cmd);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', (status) => {
      let msg = message;
      if (status !== 0) {
        console.error('command', cmd);
        msg = null;
      }
      resolve(msg);
    });
  });
}

async function sendToDisplayPanel({ message, imageFile, ledMatrix }) {
  generateTextImage({
    text: message.message,
    filename: imageFile,
    ledRows: ledMatrix.options.ledRows,
  });

  const { duration } = message.userMetadata;
  const cmdDisplayMessage = `sudo ${ledMatrix.path}/examples-api-use/demo -t ${duration} -m 25 -D 1 ./${imageFile} ${ledOptions}`;
  return await execCommand({
    cmd: cmdDisplayMessage,
    message,
    ledMatrix,
  });
}

function displayTime(ledMatrix) {
  const cmdDisplayClock = `sudo ${ledMatrix.path}/examples-api-use/clock -f ${ledMatrix.path}/fonts/8x13.bdf -d "%I:%M %p" -y 8 ${ledOptions}`;
  const child = exec(cmdDisplayClock);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

function killProcess(grepPattern) {
  const cmdKillProcess = `sudo kill $(ps aux | grep '${grepPattern}' | awk '{print $2}')`;
  exec(cmdKillProcess);
}

function generateTextImage({ text, filename, ledRows }) {
  const args = ['./generate-image.py', text, filename, ledRows];
  return spawnSync('python', args);
}

function buildLedMatrixOptions(options) {
  return `--led-rows=${options.ledRows} --led-chain=${options.ledChain} ${
    options.ledNoHardwarePulse ? '--led-no-hardware-pulse' : ''
  } --led-gpio-mapping=${options.ledGpioMapping}`;
}
