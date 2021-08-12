const AWS = require('aws-sdk');

module.exports = class SQSService {
  constructor(config) {
    this.queueUrl = config.topic;

    AWS.config.update({ region: config.region });

    this.sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
  }

  subscribe(sendMessage, sendCommand) {
    const params = {
      AttributeNames: ['userMetadata'],
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All'],
      QueueUrl: this.queueUrl,
      VisibilityTimeout: 20,
      WaitTimeSeconds: 0,
    };

    this.sqs.receiveMessage(params, (err, data) => {
      if (err) {
        console.log('SQS - error message', err);
      } else if (data.Messages && data.Messages.length > 0) {
        console.log('SQS - message', data.Messages[0]);

        let metadata = {};
        try {
          metadata = JSON.parse(
            data.Messages[0].MessageAttributes.metadata.StringValue
          );
        } catch (err) {
          console.log('SQS - error parsing metadata', err);
          return;
        }

        console.log('SQS metadata', metadata);
        const { command } = metadata;

        if (command) {
          sendCommand(command);
        } else {
          sendMessage({
            message: data.Messages[0].Body,
            userMetadata: metadata,
          });
        }

        const deleteParams = {
          QueueUrl: this.queueUrl,
          ReceiptHandle: data.Messages[0].ReceiptHandle,
        };
        this.sqs.deleteMessage(deleteParams, function (err) {
          if (err) {
            console.log('SQS - error delete message', err);
          } else {
            console.log('SQS - success delete message', data);
          }
        });
      }
    });
  }
};
