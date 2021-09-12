const {
    MESSAGES: MESSAGES_COLLECTION_NAME,
} = require('../../config.js').COLLECTION_NAMES;


const getWriteMessageProcessorFunction = (deps) => {
    const {
        db,
        logger,
    } = deps;

    return async(job) => {
        logger.info(`Job triggered: ${job.id}|${job.name}|${JSON.stringify(job.data)}`);
        const message = job.data.message;

        if(typeof message !== "string"){
            throw new Error("INVALID MESSAGE VALUE");
        }

        return db.collection(MESSAGES_COLLECTION_NAME).insertOne({
            message: message,
            createdAt: new Date(),
        })

    }

}

module.exports =  getWriteMessageProcessorFunction;