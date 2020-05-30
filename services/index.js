const PubNubService = require('./pubsub');
const MQTTService = require('./mqtt');

module.exports = class PubSubService {
  constructor(config) {
    switch (config.pubsubType) {
      case 'pubnub':
        return new PubNubService(config.pubnub);
      case 'mqtt':
        return new MQTTService(config.mqtt);
      default:
        return null;
    }
  }
};
