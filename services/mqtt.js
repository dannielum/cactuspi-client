const MQTT = require('mqtt');

module.exports = class MqttService {
  constructor(config) {
    this.config = config;
    
    this.mqtt = MQTT.connect(this.config.brokerUrl);
  }

  subscribe(sendMessage, sendCommand) {
    this.mqtt.on('connect', () => {
      this.mqtt.subscribe(this.config.topic, (err) => {
        if (err) {
          console.log('MQTT - error status', err);
        } else {
          console.log('MQTT - connected');
        }
      });
    });

    this.mqtt.on('message', (topic, buffer) => {
      const message = JSON.parse(buffer.toString());
      console.log('MQTT - message', message.message);
      sendMessage(message);
    });
  }
};

