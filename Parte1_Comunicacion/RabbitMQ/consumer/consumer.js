// Requerir módulos necesarios
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const osUtils = require('os-utils');
const fs = require("fs");

// Configurar las variables
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq';
const QUEUE = 'temperatures';
const CONSUMER_ID = uuidv4().substring(0,3);

// Definir la función para obtener el uso de la CPU
const getCPUUsage = () => {
  return new Promise(resolve => {
    osUtils.cpuUsage(v => {
      resolve(v);
    });
  });
};

// Definir la función principal para conectar y consumir mensajes
const run = async () => {
  let disconnectTimer;
  let isDisconnected = false;

  const disconnectAfterTimeout = () => {
    console.log("Desconectando el consumidor de RabbitMQ...");
    if (connection) {
      connection.close();
    }
    isDisconnected = true;
    clearTimeout(disconnectTimer);
  };

  // Intenta conectar hasta que se realice la conexión
  while (true) {
    let connection;
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      
      // Una vez conectado, establece el temporizador.
      disconnectTimer = setTimeout(disconnectAfterTimeout, 1 * 60 * 1000); // 2 minutos de tiempo de espera

      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE, { durable: false });

      console.log(`${CONSUMER_ID} waiting for messages in ${QUEUE}. To exit press CTRL+C`);

      // Limit the number of unacknowledged messages this consumer can receive
      channel.prefetch(5);

      channel.consume(QUEUE, function (msg) {
        let diferenciaMs = Date.now() - JSON.parse(msg.content.toString()).timestamp;
        let milisegundos = diferenciaMs % 1000;
        let segundos = (Math.floor(diferenciaMs / 1000)) % 60;
        const tiempoTranscurrido = `${segundos.toString().padStart(2, '0')}:${milisegundos.toString().padStart(3, '0')}`;

        getCPUUsage().then(cpuUsage => {
          cpuUsage = (cpuUsage * 100).toFixed(2);
          console.log({ value: `Tiempo: ${tiempoTranscurrido}, CPU: ${cpuUsage}% ,Valor: ${msg.content.toString()}` });
          const saveToFile = () => {
            fs.appendFile("./data/cpuUsage.txt", `${cpuUsage}|`, function (err) {
              if (err) throw err;
            });
          }
          setTimeout(saveToFile, 30 * 1000); // 30 seg de retraso
        });
      }, { noAck: true });

      break; // Si llegamos a este punto, la conexión ha sido exitosa y podemos salir del ciclo
    } catch (e) {
      console.log("Error connecting, retrying in 5 seconds", e);
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }
  }
}

// Esperar 10 segundos antes de iniciar
setTimeout(() => {
  run().catch(console.error);
}, 10000);
