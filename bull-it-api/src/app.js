const express = require("express");
const { nullResponseObj, getResponseObj } = require("./utils/responseUtils.js");
const routes = require("./routes/index.js");
const {
  jobQueue,
  jobSchedulingStrageties,
} = require("./lib/queues/jobQueue.js");

module.exports = (deps) => {
  const { getLogger, db } = deps;

  const appLogger = getLogger({
    module: "app.js",
  })
  const app = express();

  const schedulers = jobSchedulingStrageties({
    db,
    logger: getLogger({
      module: "scheduling-strategies",
    }),
    queue: jobQueue,
  })

  app.use(
    express.json({
      limit: "50mb",
    })
  );

  app.use((req, res, next) => {
    res.locals.responseObj = nullResponseObj;
    req.db = db;
    next();
  });

  app.get("/ping", (req, res, next) => {
    res.locals.responseObj = getResponseObj(200, {
      message: "pong",
    });

    next();
  });

  Object.keys(routes).forEach((route) => {
    app.use(`/${route}`, routes[route]({
      logger: getLogger({
        module: `routes/${route}`,
      }),
      schedulers,
    }));
  });

  app.use((error, req, res, next) => {
    appLogger.error({
      msg: "Error caught in default error handler",
      error: {
        message: error.message,
      },
    });
    res.locals.responseObj = getResponseObj(500, {
      message: "INTERNAL SERVER ERROR",
    });
    next();
  });

  app.use((req, res, next) => {
    const responseObj = res.locals.responseObj;
    res.set(responseObj.headers);
    res.status(responseObj.code).send(responseObj.data);
  });

  return app;
};
