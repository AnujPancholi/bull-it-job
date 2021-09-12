const getLogger = require("../utils/logger.js");

const getJobsRouter = require("./jobs.js");
const getSchedulesRouter = require('./schedules.js');

module.exports = {
  jobs: getJobsRouter,
  schedules: getSchedulesRouter,
};
