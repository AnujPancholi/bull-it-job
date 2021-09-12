"use strict";
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const CONFIG = require("./config.js")
const jobQueue = require('./lib/queues/oneTimeJobQueue.js');
const processorFunctions = require('./lib/processorFunctions/index.js');
const getLogger = require("./utils/logger.js");
const mongoLib = require('./lib/mongo.js');
const cpuUsageMonitProcess = require("./lib/processCpuUsageMonitor.js");
const logger = require("../../bull-it-api/src/utils/logger.js");


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
        startCpuProcessMonit,
        logger,
    } = deps;

    return async() => {

        try{
    
            logger.info("Process start triggered");
    
            const mongoClientInstance = await mongoLib.connectClientInstance({
                url: CONFIG.DB_URI,
            });
    
            const dbInstance = mongoClientInstance.db(CONFIG.DB_NAME); 
    
            logger.info("DB client connected");
    
            Object.keys(processorFunctions).forEach(processorName => {
                logger.info(`Adding processor: ${processorName}`);
                jobQueue.process(processorName,CONFIG.DEFAULT_JOB_CONCURRENCY,processorFunctions[processorName]({
                    db: dbInstance,
                    logger: getLogger({
                        module: processorName
                    })
                }));
            })
    
            logger.info('Processor functions added to queue');


            startCpuProcessMonit();

            
    
        } catch(e) {
            logger.error(`Error in starting server: ${e.message || ""}`);
            processExitCleanup();
            process.exit(1);
        }
    };

}

startProcess({
    jobQueue,
    startCpuProcessMonit: cpuUsageMonitProcess({
      logger: getLogger({
        module: "cpu-usage-monitor",
      }),
      MAX_CPU_USAGE_THRESHOLD: CONFIG.MAX_CPU_USAGE_THRESHOLD,
      CPU_USAGE_MONIT_FREQUENCY: CONFIG.CPU_USAGE_MONIT_FREQUENCY,
    }),
    logger: getLogger({
      module: "index.js",
    })
})();


const anomalyLogger = getLogger({
  module: "anomaly",
})

process
  .on("unhandledRejection", (reason, p) => {
    anomalyLogger.error("Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    anomalyLogger.error("Uncaught Exception thrown");
    processExitCleanup();
    process.exit(1);
  })
  .on("SIGINT", function () {
    anomalyLogger.info("SIGINT observed");
    processExitCleanup();
    process.exit(0);
  });