// device.js
const { Kafka } = require('kafkajs')
const { v4: uuidv4 } = require('uuid')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
})

const topic = 'temperatures'
const deviceId = "Grupox"//uuidv4().substring(0,3);
const deltaT = process.env.DELTA_T ||5000;

const producer = kafka.producer()

const produceMessage = async () => {

  try {
    let numeroAleatorio = Math.floor(Math.random() * 50) + 1;
    let i = 0;
    while(numeroAleatorio > i){
      await producer.send({
        topic: topic,
        messages: [
          { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: {data: uuidv4() }})},
        ],
      })
    i++;}
    setTimeout(produceMessage, deltaT)
  } catch (error) {
    console.error(`Error producing message: ${error}`)
    setTimeout(produceMessage, deltaT)
  }
}

const run = async () => {
  await producer.connect()
  await produceMessage()
}

run().catch(console.error)

