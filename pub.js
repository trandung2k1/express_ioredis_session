const Redis = require('ioredis');
const redis = new Redis();
const redis2 = new Redis();
//channel1

setInterval(() => {
    const channel = `my-channel-1`;
    redis.publish(channel, JSON.stringify('Hello'));
}, 1000);

// channel2
redis2.subscribe('my-channel-2', (err, count) => {
    if (err) {
        console.error('Failed to subscribe: %s', err.message);
    } else {
        console.log(
            `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
    }
});

redis2.on('message', (channel, message) => {
    console.log(`Received ${message} from ${channel}`);
});
