const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');
const osUtils = require('os-utils');
const fs = require("fs");

const url = 'amqp://guest:guest@rabbitmq'; // cambiar según tu configuración
const exchange = 'sensors';
const topic = process.env.RABBITMQ_TOPIC || 'temperatures';
const queueName = uuidv4().substring(0, 6);

const getCPUUsage = () => {
  return new Promise(resolve => {
    osUtils.cpuUsage(v => {
      resolve(v);
    });
  });
};

const run = async () => {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'direct', { durable: false });
  const q = await channel.assertQueue(queueName, { exclusive: true });

  console.log(`[*] Waiting for messages in queue ${q.queue}. To exit press CTRL+C`);

  channel.bindQueue(q.queue, exchange, topic);

  channel.consume(q.queue, async (msg) => {
    const secs = msg.content.toString().split('.').length - 1;
    const message = JSON.parse(msg.content.toString());

    let diferenciaMs = Date.now() - message.timestamp;
    let milisegundos = diferenciaMs % 1000;
    let segundos = (Math.floor(diferenciaMs / 1000)) % 60;
    const tiempoTranscurrido = `${segundos.toString().padStart(2, '0')}:${milisegundos.toString().padStart(3, '0')}`;

    getCPUUsage().then(cpuUsage => {
      cpuUsage = (cpuUsage * 100).toFixed(2);
      console.log({ value: `Tiempo: ${tiempoTranscurrido}, CPU: ${cpuUsage}% ,Valor: ${message.values.data}` });

      const saveToFile = () => {
        fs.appendFile("./data/cpuUsage.txt", `${cpuUsage}|`, function (err) {
          if (err) throw err;
        });
      }
      setTimeout(saveToFile, 3 * 60 * 1000); // 30 segundos de retraso
    });
  }, {
    noAck: true
  });
};

// Esperar 10 segundos antes de iniciar
setTimeout(() => {
  run().catch(console.error);
}, 10000);
