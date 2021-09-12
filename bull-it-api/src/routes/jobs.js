const express = require("express")
const { getResponseObj } = require("../utils/responseUtils.js");
const { JOBS: JOBS_COLLECTION_NAME } = require("../config.js").COLLECTION_NAMES;

const getJobsRouter = (deps) => {
  const { logger } = deps;

  const jobsRouter = express.Router();

  const jobsQueryBuilder = () => {
    const queryObj = {};
    return {
      addJobId: function (jobId = null) {
        if (typeof jobId === "string" && jobId.length > 0) {
          queryObj._id = jobId;
        }
        return this;
      },
      addSchedulingStrategies: function (schedulingStrategies = null) {
        if (schedulingStrategies !== null) {
          queryObj.schedulingStrategies = {
            $in: schedulingStrategies,
          };
        }
        return this;
      },
      build: function () {
        return queryObj;
      },
    };
  };

  jobsRouter.get("/fetch", async (req, res, next) => {
    const queryParams = req.query || {};

    try {
      const queryObj = jobsQueryBuilder()
        .addJobId(queryParams._id || null)
        .addSchedulingStrategies(
          queryParams.schedulingStrategies
            ? queryParams.schedulingStrategies.split(",")
            : null
        )
        .build();

      logger.info(queryObj);

      const jobsCursor = req.db.collection(JOBS_COLLECTION_NAME).find(queryObj);
      const jobs = [];
      while (await jobsCursor.hasNext()) {
        const jobObj = await jobsCursor.next();
        jobObj.jobId = jobObj._id;
        delete jobObj._id;
        jobs.push(jobObj);
      }

      res.locals.responseObj = getResponseObj(200, {
        jobs,
      });

      next();
    } catch (e) {
      logger.error(e.message || "An error occurred");
      next(e);
    }
  });

  return jobsRouter;
};

module.exports = getJobsRouter;
