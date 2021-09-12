"use strict";
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const CONFIG = require("./config.js")
const jobQueue = require('./lib/queues/oneTimeJobQueue.js');
const processorFunctions = require('./lib/processorFunctions/index.js');
const getLogger = require("./utils/logger.js");
const mongoLib = require('./lib/mongo.js')


const processStartLogger = getLogger({
    module: "index.js",
});


const processExitCleanup = () => {
    const dbClientInstance = mongoLib.getClientInstance();
    if (
      dbClientInstance instanceof mongoLib.MongoClient &&
      dbClientInstance.isConnected()
    ) {
      dbClientInstance.close();
    }
  };


const startProcess = (deps) => {

    const {
        jobQueue,
    } = deps;

    return async() => {

        try{
    
            processStartLogger.info("Process start triggered");
    
            const mongoClientInstance = await mongoLib.connectClientInstance({
                url: CONFIG.DB_URI,
            });
    
            const dbInstance = mongoClientInstance.db(CONFIG.DB_NAME); 
    
            processStartLogger.info("DB client connected");
    
            Object.keys(processorFunctions).forEach(processorName => {
                processStartLogger.info(`Adding processor: ${processorName}`);
                jobQueue.process(processorName,CONFIG.DEFAULT_JOB_CONCURRENCY,processorFunctions[processorName]({
                    db: dbInstance,
                    logger: getLogger({
                        module: processorName
                    })
                }));
            })
    
            processStartLogger.info('Processor functions added to queue');
    
        } catch(e) {
            processStartLogger.error(`Error in starting server: ${e.message || ""}`);
            processExitCleanup();
            process.exit(1);
        }
    };

}

startProcess({
    jobQueue,
})();


process
  .on("unhandledRejection", (reason, p) => {
    processStartLogger.error("Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    processStartLogger.error("Uncaught Exception thrown");
    processExitCleanup();
    process.exit(1);
  })
  .on("SIGINT", function () {
    processStartLogger.info("SIGINT observed");
    processExitCleanup();
    process.exit(0);
  });