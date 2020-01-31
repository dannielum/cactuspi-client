# Cactus Pi Client #
A Raspberry Pi client listened to a server/hub to receive messages in order to display messages on a LED matrix display board.

## Hardware Setup ##
- Raspberry Pi
- Adafruit RGB Matrix HAT
- Adafruit 32x16 RGB LED Matrix

## Instructions ##
This project is using [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix/tree/master/utils) to render messages on LED Matrix and PubNub for the publish/subscribe service. For more details on how to setup this project, please read https://codeburst.io/creating-a-nodejs-led-matrix-display-framework-with-raspberry-pi-955509baea8c.

1. Download [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix/tree/master/utils). You can read more on how to setup `rpi-rgb-led-matrix` [here](https://github.com/hzeller/rpi-rgb-led-matrix/tree/master/utils) or follow the instruction below:
```
git clone https://github.com/hzeller/rpi-rgb-led-matrix.git
cd rpi-rgb-led-matrix
make -C examples-api-use
sudo examples-api-use/demo -D0
sudo apt-get update
sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev
cd utils
make video-viewer
```
2. Download `cactuspi-client`.
```
git clone https://github.com/dannielum/cactuspi-client.git
cd cactuspi-client
npm i
```
3. Create `config.json`.
```
cd cactuspi-client
cp config.json.sample config.json
```
4. Open `config.json` and replace the `ledMatrix.path` from `"/path/to/rpi-rgb-led-matrix"` to the path of where you put your `rpi-rgb-led-matrix` directory. It is better to use absolute path than relative path to avoid problem.
5. Replace the PubNub configs in `config.json`
