const kafka = require("./client");

async function initConsumer() {
  try {
    const consumer = kafka.consumer({ groupId: "buildverse-api" });
    await consumer.connect();
    console.log("[Kafka Consumer] Connected successfully to broker.");
  } catch (err) {
    console.log("[Kafka Consumer] Broker connection skipped (standalone mode).");
  }
}

module.exports = { initConsumer };