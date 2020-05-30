const PubNub = require('pubnub');

module.exports = class PubNubService {
  constructor(config) {
    this.config = config;
    
    this.pubNub = new PubNub({
      subscribeKey: this.config.subscribeKey,
      secretKey: this.config.secretKey,
      ssl: true,
    });
  }

  subscribe(sendMessage, sendCommand) {
    this.pubNub.subscribe({
      channels: this.config.channels,
    });

    this.pubNub.addListener({
      status: (statusEvent) => {
        if (statusEvent.category === 'PNConnectedCategory') {
          console.log('PubNub - statusEvent', statusEvent);
        } else if (statusEvent.category === 'PNUnknownCategory') {
          const newState = { new: 'error' };
          pubNub.setState({ state: newState }, (status) => {
            console.error(
              'PubNub - error message',
              statusEvent.errorData.message
            );
            console.error('PubNub - error status', status);
          });
        }
      },
      message: (msg) => {
        console.log('PubNub - message', msg);
        const { command } = msg.userMetadata;
        if (command) {
          sendCommand(command);
        } else {
          sendMessage(msg);
        }
      },
    });
  }
};
