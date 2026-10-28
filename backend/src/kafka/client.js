const { Kafka } = require("kafkajs");
const env = require("../config/env");

const kafka = new Kafka({
  clientId: "buildverse-api",
  brokers: [env.KAFKA_BROKER],
});

module.exports = kafka;