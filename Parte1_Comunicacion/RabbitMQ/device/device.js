// Requerir módulos necesarios
const amqp = require('amqplib/callback_api');
const { v4: uuidv4 } = require('uuid');

// Configurar las variables
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq';
const QUEUE = 'temperatures';
const DEVICE_ID = uuidv4().substring(0,3);
const DELTA_T = 300;

let successCount = 0;
let errorCount = 0;

// Definir la función para enviar mensajes
const sendMessage = (channel, isError = false) => {
  let message;
  //if (!isError) {
  if(true){
    message = {
      deviceId: DEVICE_ID,
      timestamp: Date.now(),
      values: {data: uuidv4()}
    };
  } else {
    message = {
      deviceId: DEVICE_ID,
      timestamp: Date.now(),
      values: {data: uuidv4()}
    };
    message.circularReference = message; // Non-serializable message (circular reference)
  }
  try {
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)));
    successCount++;
  } catch (error) {
    console.error(`Error producing message: ${error}`);
    errorCount++;
  }
};

// Definir la función para producir mensajes
const produceMessages = async (channel) => {
  let i = 0;
  while(50 > i){
    const isError = i % 2 !== 0;
    sendMessage(channel, isError);
    i++;

    
  }
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

      // Asegurar que la cola existe
      channel.assertQueue(QUEUE, { durable: false });

      // Producir mensajes
      produceMessages(channel);
    });
  });
};

// Esperar 10 segundos antes de conectarse
setTimeout(connectAndCreateChannel, 10000);
