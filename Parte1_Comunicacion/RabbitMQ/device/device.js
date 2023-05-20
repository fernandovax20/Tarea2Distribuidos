// device.js
const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE = process.env.QUEUE || 'temperatures';
const DEVICE_ID = process.env.DEVICE_ID || 'Device';
const DELTA_T = parseInt(process.env.DELTA_T) || 5000;

const getRandomTemperature = () => {
  return (Math.random() * 10 + 20).toFixed(2);
};

const sendMessage = (channel) => {
  const message = {
    deviceId: DEVICE_ID,
    timestamp: Date.now(),
    values: {data: generarCadenaAleatoria(Math.floor(Math.random() * 10) + 1)}
  };

  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)));
  //console.log(`Sent message from ${DEVICE_ID}: ${JSON.stringify(message)}`);
};

function generarCadenaAleatoria(longitud) {
  var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var cadenaAleatoria = '';
  for (var i = 0; i < longitud; i++) {
      cadenaAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return cadenaAleatoria;
}

amqp.connect(RABBITMQ_URL, function (error0, connection) {
  if (error0) throw error0;
  connection.createChannel(function (error1, channel) {
    if (error1) throw error1;

    channel.assertQueue(QUEUE, { durable: false });

    setInterval(() => {
      sendMessage(channel);
    }, DELTA_T);
  });
});

