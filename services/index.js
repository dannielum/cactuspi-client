const PubNubService = require('./pubsub');
const MQTTService = require('./mqtt');

module.exports = class PubSubService {
  pubsubService;

  constructor(config) {
    switch (config.pubsubType) {
      case 'pubnub':
        return this.pubsubService = new PubNubService(config.pubnub);
      case 'mqtt':
        return this.pubsubService = new MQTTService(config.mqtt);
    }
  }

  subscribe(messageCallback, commandCallback) {
    this.pubsubService.subscribe(messageCallback, commandCallback)
  }
};
