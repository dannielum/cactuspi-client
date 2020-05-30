const MQTT = require('mqtt');

module.exports = class MqttService {
  constructor(config) {
    this.config = config;
  }

  subscribe(sendMessage, sendCommand) {
    this.mqtt = MQTT.connect(this.config.brokerUrl);
    
    this.mqtt.on('connect', function () {
      this.mqtt.subscribe(this.config.topic, function (err) {
        if (err) {
          console.log('MQTT - error status', err);
        } else {
          console.log('MQTT - connected');
        }
      });
    });

    this.mqtt.on('message', function (topic, message) {
      console.log('MQTT - message', message);
      const { command } = message.userMetadata;
      if (command) {
        sendCommand(command);
      } else {
        sendMessage(message);
      }
      console.log(message.toString());
    });
  }
};

