let producer = null;
let kafkaAvailable = null;

exports.publish = async (topic, message) => {
  if (kafkaAvailable === false) return;
  try {
    if (!producer) {
      const kafka = require("./client");
      producer = kafka.producer({ retry: { retries: 0 } });
      await producer.connect();
      kafkaAvailable = true;
    }
    await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
  } catch (_err) {
    kafkaAvailable = false;
    // Gracefully handle standalone mode without Kafka broker
  }
};