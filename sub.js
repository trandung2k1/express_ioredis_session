const Redis = require('ioredis');
const redis = new Redis();
const redis2 = new Redis();
const channel2 = `my-channel-2`;

redis.subscribe('my-channel-1', (err, count) => {
    if (err) {
        // Just like other commands, subscribe() can fail for some reasons,
        // ex network issues.
        console.error('Failed to subscribe: %s', err.message);
    } else {
        // `count` represents the number of channels this client are currently subscribed to.
        console.log(
            `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
    }
});

redis.on('message', (channel, message) => {
    console.log(`Received ${message} from ${channel}`);

    setInterval(() => {
        redis2.publish(channel2, JSON.stringify('Oke'));
    }, 1000);
});
