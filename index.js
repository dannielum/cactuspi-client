const fs = require('fs');
const text2png = require('text2png');
const sys = require('sys')
const exec = require('child_process').exec;

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile);

function runCommand(cmd, timeout) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
    });
    setTimeout(function() {
      resolve("still running...");
    }, timeout);
  });
}

const { logo, ledMatrix } = config;

fs.writeFileSync(
  'init.png',
  text2png(config.initMessage, {
    font: '60px Arial',
    textColor: 'teal',
    bgColor: 'linen',
    lineSpacing: 10,
    padding: 20,
    output: 'buffer'
  })
);

const cmdDisplayLogo = `sudo ${ledMatrix.path}/led-image-viewer ${logo} --led-rows=${ledMatrix.ledRows} --led-chain=${ledMatrix.ledChain} ${ledMatrix.ledNoHardwarePulse ? '--led-no-hardware-pulse' : ''} --led-gpio-mapping=${ledMatrix.ledGpioMapping}`;

console.log('cmdDisplayLogo', cmdDisplayLogo);
runCommand(cmdDisplayLogo, 1000).then(function(data) {
  console.log("success: ", data);
}, function(err) {
  console.log("fail: ", err);
});

// exec(`sudo ./demo --led-rows=32 --led-chain=2 -t 60 -m 25 -D 1 "+disp+" --led-no-hardware-pulse --led-gpio-mapping=adafruit-hat`, puts);
