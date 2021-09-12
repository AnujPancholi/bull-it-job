"use strict";
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const app = require("./app.js");
const getLogger = require("./utils/logger.js");
const {
  jobQueue,
  addEventListenersToQueue,
} = require('./lib/queues/jobQueue.js');
const mongoLib = require("./lib/mongo.js");
const CONFIG = require("./config.js");
const mongo = require("./lib/mongo.js");

const serverStartLogger = getLogger({
  module: "index.js",
});

const processExitCleanup = () => {
  serverStartLogger.info("Running cleanup before exit...");
  const dbClientInstance = mongoLib.getClientInstance();
  if (
    dbClientInstance instanceof mongoLib.MongoClient &&
    dbClientInstance.isConnected()
  ) {
    dbClientInstance.close();
  }
};

const startServer = async () => {
  try {
    serverStartLogger.info("Server start triggered");
    
    const mongoClientInstance = await mongoLib.connectClientInstance({
      url: CONFIG.DB_URI,
    });

    serverStartLogger.info("DB client fetched");

    const dbInstance = mongoClientInstance.db(CONFIG.DB_NAME);

    addEventListenersToQueue(jobQueue,{
      logger: getLogger({
        module: "lib/queues/jobQueue.js",
      }),
      db: dbInstance,
      getValidObjectId: mongo.getValidObjectId,
    })

    serverStartLogger.info("Starting API server...");
    app({
      getLogger,
      db: dbInstance,
    }).listen(CONFIG.PORT, () => {
      serverStartLogger.info(
        `${CONFIG.SERVICE_NAME} listening on port ${CONFIG.PORT}`
      );
    });
  } catch (e) {
    serverStartLogger.error(`Error in starting server: ${e.message || ""}`);
    processExitCleanup();
    process.exit(1);
  }
};

// start the server
startServer();

process
  .on("unhandledRejection", (reason, p) => {
    serverStartLogger.error("Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    serverStartLogger.error("Uncaught Exception thrown");
    processExitCleanup();
    process.exit(1);
  })
  .on("SIGINT", function () {
    serverStartLogger.info("SIGINT observed");
    processExitCleanup();
    process.exit(0);
  });
