// consumer.js
const { Kafka } = require('kafkajs')
const { v4: uuidv4 } = require('uuid')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
})

const topic = process.env.KAFKA_TOPIC || 'topic'
const groupId = uuidv4().substring(0,6)

const consumer = kafka.consumer({ groupId: groupId })

const run = async () => {
  while (true) {
    try {
      await consumer.connect()
      await consumer.subscribe({ topic: topic, fromBeginning: true })

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          let diferenciaMs = Date.now() - message.timestamp;
          let milisegundos = diferenciaMs % 1000;
          let segundos = (Math.floor(diferenciaMs / 1000))%60;
          const tiempoTranscurrido = `${segundos.toString().padStart(2, '0')}:${milisegundos.toString().padStart(3, '0')}`;

          console.log({ value: `Tiempo: ${tiempoTranscurrido}, Valor: ${message.value.toString()}` });

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



