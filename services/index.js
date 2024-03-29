const SQSService = require('./sqs');
const PubNubService = require('./pubsub');
const MQTTService = require('./mqtt');

module.exports = class PubSubService {
  constructor(config) {
    switch (config.pubsubType) {
      case 'sqs':
        return new SQSService(config.sqs);
      case 'pubnub':
        return new PubNubService(config.pubnub);
      case 'mqtt':
        return new MQTTService(config.mqtt);
      default:
        return null;
    }
  }
};
