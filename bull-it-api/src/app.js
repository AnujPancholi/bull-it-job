const express = require("express");
const { nullResponseObj, getResponseObj } = require("./utils/responseUtils.js");
const routes = require("./routes/index.js");
const {
  jobQueue,
  jobSchedulingStrageties,
} = require("./lib/queues/jobQueue.js");
const ExtendedError = require("./lib/errors/extendedError.js");

module.exports = (deps) => {
  const { getLogger, db } = deps;

  const errLogger = getLogger({
    module: "error-handler",
  })

  const requestsLogger = getLogger({
    module: "requests",
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

    requestsLogger.info({
      msg: "Request received",
      method: req.method,
      url: req.url,
      headers: req.headers,
      data: req.body,
    })

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
    errLogger.error({
      msg: "Error caught in default error handler",
      error: {
        message: error.message,
      },
    });

    if(error instanceof ExtendedError){
      res.locals.responseObj = error.responseObj;
    } else {
      res.locals.responseObj = getResponseObj(500, {
        message: "INTERNAL SERVER ERROR",
      });
    }

    next();
  });

  app.use((req, res, next) => {
    const responseObj = res.locals.responseObj;

    requestsLogger.info({
      msg: "Response prepared",
      code: responseObj.code,
      headers: {
        ...res.getHeaders(),
        ...responseObj.headers,
      },
      data: responseObj.data,
    })
    res.set(responseObj.headers);
    res.status(responseObj.code).send(responseObj.data);
  });

  return app;
};
