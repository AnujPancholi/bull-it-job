const getLogger = require("../utils/logger.js");

const getJobsRouter = require("./jobs.js");
const getSchedulesRouter = require('./schedules.js');
const getMessagesRouter = require('./messages.js');

module.exports = {
  jobs: getJobsRouter,
  schedules: getSchedulesRouter,
  messages: getMessagesRouter,
};
