const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka:9092']
});

const temperatureTopic = 'temperatures';
const humidityTopic = 'humidity';
const co2Topic = 'co2';
const lightSensorTopic = 'light-sensor';
const phTopic = 'ph';

const deviceId = uuidv4().substring(0, 3);
const deltaT = 300;

const producer = kafka.producer();

const produceMessage = async () => {
  try {
    // Enviar mensajes a diferentes tópicos según la categoría
    await producer.send({
      topic: temperatureTopic,
      messages: [
        { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: { data: uuidv4() } }) },
      ],
    });

    await producer.send({
      topic: humidityTopic,
      messages: [
        { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: { data: uuidv4() } }) },
      ],
    });

    await producer.send({
      topic: co2Topic,
      messages: [
        { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: { data: uuidv4() } }) },
      ],
    });

    await producer.send({
      topic: lightSensorTopic,
      messages: [
        { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: { data: uuidv4() } }) },
      ],
    });

    await producer.send({
      topic: phTopic,
      messages: [
        { value: JSON.stringify({ device_id: deviceId, timestamp: Date.now(), values: { data: uuidv4() } }) },
      ],
    });

    setTimeout(produceMessage, deltaT);
  } catch (error) {
    console.error(`Error producing message: ${error}`);
    setTimeout(produceMessage, deltaT);
  }
};

const run = async () => {
  await producer.connect();
  await produceMessage();
};

run().catch(console.error);
