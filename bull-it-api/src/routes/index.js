const getLogger = require("../utils/logger.js");

const getJobsRouter = require("./jobs.js");

module.exports = {
  jobs: getJobsRouter({
    logger: getLogger({
      module: "routes/jobs.js",
    }),
  }),
};
