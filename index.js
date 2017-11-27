const fs = require('fs');
const text2png = require('text2png');
const exec = require('child_process').exec;

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

const { logo, ledMatrix } = config;

fs.writeFileSync(
  'init.png',
  text2png(config.initMessage, {
    font: '60px Arial',
    textColor: 'teal',
    lineSpacing: 10,
    padding: 20,
    output: 'buffer'
  })
);

const cmdDisplayLogo = `sudo ${ledMatrix.path}/led-image-viewer ${logo} -t2 ${buildLedMatrixOptions(ledMatrix.options)}`;
exec(cmdDisplayLogo, puts);

console.log(cmdDisplayLogo);
// runCommand(`sudo ./demo --led-rows=32 --led-chain=2 -t 60 -m 25 -D 1 "+disp+" --led-no-hardware-pulse --led-gpio-mapping=adafruit-hat`, 2000);
