// device.js
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
})

const topic = 'temperatures'
const deviceId = process.env.DEVICE_ID || '1'
const deltaT = process.env.DELTA_T ||5000;

const producer = kafka.producer()

const produceMessage = async () => {
  await producer.send({
    topic: topic,
    messages: [
      { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: {data: generarCadenaAleatoria(Math.floor(Math.random() * 10) + 1)} }) },
    ],
  })
  //console.log(`Device ${deviceId} produced message`)
  setTimeout(produceMessage, deltaT)
}

function generarCadenaAleatoria(longitud) {
  var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var cadenaAleatoria = '';
  for (var i = 0; i < longitud; i++) {
      cadenaAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return cadenaAleatoria;
}

const run = async () => {
  await producer.connect()
  await produceMessage()
}

run().catch(console.error)
