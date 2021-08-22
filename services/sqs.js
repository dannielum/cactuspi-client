const { Consumer } = require('sqs-consumer');

module.exports = class SQSService {
  constructor(config) {
    this.queueUrl = config.topic;
  }

  subscribe(sendMessage, sendCommand) {
    const app = Consumer.create({
      queueUrl: this.queueUrl,
      attributeNames: ['userMetadata'],
      messageAttributeNames: ['All'],
      handleMessage: (message) => {
        console.log('SQS - message', message);

        let metadata = {};
        try {
          metadata = JSON.parse(message.MessageAttributes.metadata.StringValue);
        } catch (err) {
          console.log('SQS - error parsing metadata', err);
          return;
        }

        const { command } = metadata;

        if (command) {
          sendCommand(command);
        } else {
          sendMessage({
            message: message.Body,
            userMetadata: metadata,
          });
        }
      }
    });
    
    app.on('error', (err) => {
      console.log('SQS - error message', err);
    });
    
    app.on('processing_error', (err) => {
      console.log('SQS - error processing message', err);
    });
    
    app.start();
  }
};
