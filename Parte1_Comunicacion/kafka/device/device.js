// device.js
const { Kafka } = require('kafkajs')
const { v4: uuidv4 } = require('uuid')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
})

const topic = 'temperatures'
const deviceId = uuidv4().substring(0,3);
const deltaT = 300;

const producer = kafka.producer()

const produceMessage = async () => {
  try {
    let i = 0;
    while(200 > i){

      let message;
      // Generate an error every 10 seconds
      //if (i % 2 === 0) {
      if(true){
        // Regular serializable message
        message = { device_id: deviceId, timestamp: Date.now(), values: {data: uuidv4() }};
      } else {
        // Non-serializable message (circular reference)
        message = { device_id: deviceId, timestamp: Date.now(), values: {data: uuidv4() }};
        message.circularReference = message;
      }

      await producer.send({
        topic: topic,
        messages: [
          { value: JSON.stringify(message) },
        ],
      })
      
      i++;

    }

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

