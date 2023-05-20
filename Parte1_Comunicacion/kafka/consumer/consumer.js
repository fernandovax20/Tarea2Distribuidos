// consumer.js
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
})

const topic = process.env.KAFKA_TOPIC || 'topic'
const groupId = process.env.GROUP_ID || 'test-group'

const consumer = kafka.consumer({ groupId: groupId })

const run = async () => {
  while (true) {
    try {
      await consumer.connect()
      await consumer.subscribe({ topic: topic, fromBeginning: true })
  
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {console.log({value: message.value.toString()})},
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



