// Requerir módulos necesarios
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');

// Configurar las variables
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq'; // usar la URL del servicio de RabbitMQ
const EXCHANGE = 'sensors';
const DELTA_T = 300;

const deviceId = uuidv4().substring(0, 3);

// Función para producir mensajes
const produceMessages = async (channel) => {
  const topics = ['temperatures', 'humidity', 'co2', 'light-sensor', 'ph'];
  topics.forEach((topic) => {
    const message = JSON.stringify({
      device_id: deviceId,
      timestamp: Date.now(),
      values: { data: uuidv4() },
    });

    channel.publish(EXCHANGE, topic, Buffer.from(message));
  });

  setTimeout(() => produceMessages(channel), DELTA_T);
};

// Función para conectarse a RabbitMQ y crear un canal
const connectAndCreateChannel = () => {
  amqp.connect(RABBITMQ_URL, function (error0, connection) {
    if (error0) {
      console.error("Error connecting to RabbitMQ: ", error0);
      process.exit(1);
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        console.error("Error creating channel: ", error1);
        process.exit(1);
      }

      // Asegurar que el exchange existe
      channel.assertExchange(EXCHANGE, 'direct', { durable: false });

      // Producir mensajes
      produceMessages(channel);
    });
  });
};

// Esperar 10 segundos antes de conectarse
setTimeout(connectAndCreateChannel, 10000);