const AWS = require('aws-sdk');

module.exports = class SQSService {
  constructor(config) {
    this.config = config;

    AWS.config.update({ region: this.config.region });

    this.sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
  }

  subscribe(sendMessage, sendCommand) {
    const params = {
      AttributeNames: ['userMetadata'],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All'],
      QueueUrl: this.config.topic,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0,
    };

    this.sqs.receiveMessage(params, function (err, data) {
      if (err) {
        console.log('SQS - error message', err);
      } else if (data.Messages) {
        console.log('SQS - message', data);
        const { command } = JSON.parse(msg.userMetadata) || {};
        if (command) {
          sendCommand(command);
        } else {
          sendMessage(msg);
        }

        const deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: data.Messages[0].ReceiptHandle,
        };
        sqs.deleteMessage(deleteParams, function (err, data) {
          if (err) {
            console.log('PubNub - delete message error', err);
          }
        });
      }
    });
  }
};
