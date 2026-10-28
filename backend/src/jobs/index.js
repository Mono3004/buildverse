const startEmailWorker = require("../queues/email.worker");
const digestJob = require("./digest.job");

module.exports = function startJobs() {
  startEmailWorker();
  digestJob();
};