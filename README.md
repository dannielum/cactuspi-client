# Cactus Pi Client #
A Raspberry Pi client listened to a server/hub to receive messages in order to display messages on a LED matrix display board.

CactusPi start up screen:

[![LED Matrix cactuspi start up screen](http://img.youtube.com/vi/D7HpxsstZxc/0.jpg)](http://www.youtube.com/watch?v=D7HpxsstZxc)

CactusPi displaying bus time:

[![Cactus pi picture frame fetch bus time](http://img.youtube.com/vi/XhUqg26Vov0/0.jpg)](http://www.youtube.com/watch?v=XhUqg26Vov0)

## Hardware Setup ##
- Raspberry Pi
- Adafruit RGB Matrix HAT
- Adafruit 32x16 RGB LED Matrix

![hardware](./assets/hardware.jpeg "hardware")

## Instructions ##
This project is using [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix/tree/master/utils) to render messages on LED Matrix. PubNub or MQTT for the publish/subscribe service. For more details on how to setup this project, please read https://codeburst.io/creating-a-nodejs-led-matrix-display-framework-with-raspberry-pi-955509baea8c.

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
5. Replace the SQS, PubNub, or MQTT configs in `config.json`.
6. Set `pubsubType` to either `pubnub` or `mqtt` in `config.json`.

## Publisher/Subscriber Service ##
You can now choose between SQS, PubNub, and MQTT as your pubsub service. MQTT support is added mainly to integrate it to [Home Assistant](https://www.home-assistant.io/).
