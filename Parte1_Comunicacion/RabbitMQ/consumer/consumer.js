// consumer.js
const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = process.env.QUEUE || 'temperatures';
const CONSUMER_ID = process.env.CONSUMER_ID || 'Consumer';

amqp.connect(RABBITMQ_URL, function (error0, connection) {
  if (error0) throw error0;
  connection.createChannel(function (error1, channel) {
    if (error1) throw error1;

    channel.assertQueue(QUEUE, { durable: false });

    console.log(`${CONSUMER_ID} waiting for messages in ${QUEUE}. To exit press CTRL+C`);

    channel.consume(QUEUE, function (msg) {
      console.log(`${CONSUMER_ID} Received: ${msg.content.toString()}`);
    }, { noAck: true });
  });
});


