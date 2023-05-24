const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const osUtils = require('os-utils');
const fs = require("fs");

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
})

const topic = process.env.KAFKA_TOPIC
const groupId = process.env.GROUP_ID

const consumer = kafka.consumer({ groupId: groupId })

const getCPUUsage = () => {
  return new Promise(resolve => {
    osUtils.cpuUsage(v => {
      resolve(v);
    });
  });
};

const run = async () => {
  let disconnectTimer;
  let isDisconnected = false;

  const disconnectAfterTimeout = async () => {
    console.log("Desconectando el consumidor de Kafka...");
    await consumer.disconnect();
    isDisconnected = true;
    clearTimeout(disconnectTimer);
  };

  while (true) {
    try {
      if (isDisconnected) break;

      await consumer.connect()
      
      // Una vez conectado, establezca el temporizador.
      disconnectTimer = setTimeout(disconnectAfterTimeout, 4 * 60 * 1000); // 2 minutos de tiempo de espera
      
      await consumer.subscribe({ topic: topic, fromBeginning: true })

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          let diferenciaMs = Date.now() - message.timestamp;
          let milisegundos = diferenciaMs % 1000;
          let segundos = (Math.floor(diferenciaMs / 1000)) % 60;
          const tiempoTranscurrido = `${segundos.toString().padStart(2, '0')}:${milisegundos.toString().padStart(3, '0')}`;

          getCPUUsage().then(cpuUsage => {
            cpuUsage = (cpuUsage * 100).toFixed(2);
            console.log({ value: `Tiempo: ${tiempoTranscurrido}, CPU: ${cpuUsage}% ,Valor: ${message.value.toString()}` });
            const saveToFile = () => {
              fs.appendFile("./data/cpuUsage.txt", `${cpuUsage}|`, function (err) {
                if (err) throw err;
              }
              );
            }
            setTimeout(saveToFile, 3 * 60 * 1000); // 30 segundos de retraso
          });

        },
      })
      break;
    } catch (e) {
      console.log("Error connecting, retrying in 5 seconds", e);
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }
  }
}

run().catch(console.error)
