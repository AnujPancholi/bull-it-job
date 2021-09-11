const express = require("express");
const { nullResponseObj, getResponseObj } = require("./utils/responseUtils.js");
const routes = require("./routes/index.js");

module.exports = (deps) => {
  const { appLogger, db } = deps;

  const app = express();

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
    app.use(`/${route}`, routes[route]);
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
