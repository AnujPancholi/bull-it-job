const Queue = require('bull');
const {
    JOB_QUEUE_REDIS_URI,
    COLLECTION_NAMES,
} = require('../../config.js');

const {
    SCHEDULES: SCHEDULES_COLLECTION_NAME
} = COLLECTION_NAMES

const jobQueue = new Queue('one-time-jobs',JOB_QUEUE_REDIS_URI);


const addEventListenersToQueue = (queueObj,deps) => {
    const {
        db,
        logger,
        getValidObjectId,
    } = deps;

    logger.info(`Adding event listeners to queue...`);

    queueObj.on('global:completed', async function (jobid, result) {
        logger.info(`Job ${jobid}: completed`);
        const scheduleDbId = jobid.split('#')[1] || "";

        try{
            await db.collection(SCHEDULES_COLLECTION_NAME).updateOne({
                _id: getValidObjectId(scheduleDbId),
            },{
                $set: {
                    state: "COMPLETED",
                    finishedAt: new Date(),
                }
            })

            logger.info(`Job ${jobid}: Schedule updated`);

        }catch(e){
            logger.error(`Job ${jobid}: Error in updating schedule: ${e.message}`);
        }
    })

    queueObj.on('global:failed', async function (jobid, err) {
        logger.info(`Job ${jobid}: failed: ${err.message}`);
        const scheduleDbId = jobid.split('#')[1] || "";

        try{
            await db.collection(SCHEDULES_COLLECTION_NAME).updateOne({
                _id: getValidObjectId(scheduleDbId),
            },{
                $set: {
                    state: "FAILED",
                    finishedAt: new Date(),
                }
            })

            logger.info(`Job ${jobid}: Schedule updated`);

        }catch(e){
            logger.error(`Job ${jobid}: Error in updating schedule: ${e.message}`);
        }
    })
    
}

const jobSchedulingStrageties = (deps) => {
    const {
        db,
        logger,
        queue,
    } = deps;

    //can store all these in separate files
    return {
        "DEFAULT#": () => {
            throw new Error("SCHEDULING STRATEGY NOT FOUND");
        },
        "one-time-timestamped": async(jobId,data) => {
            const {
                timestamp: rawTimestamp,
            } = data;
            const timestampDateObj = new Date(rawTimestamp);
            if(!rawTimestamp || isNaN(timestampDateObj.valueOf())){
                throw new Error('INVALID TIMESTAMP');
            }

            const {
                insertedId
            } = await db.collection(SCHEDULES_COLLECTION_NAME).insertOne({
                jobId: jobId,
                schedulingStrategy: "one-time-timestamped",
                data: data,
                state: "SCHEDULED",
                createdAt: new Date(),
            })

            const queueJobId = `one-time-timestamped#${insertedId}`;
            
            const delay = Math.max(timestampDateObj.valueOf() - Date.now(),0);
            queue.add(jobId,data,{
                delay: delay,
                jobId: queueJobId,
            })

            return {
                isSuccessful: true,
                error: null,
                queueJobId,
                scheduleId: insertedId,
            }
        }
    }
}

module.exports = {
    jobQueue,
    addEventListenersToQueue,
    jobSchedulingStrageties,
};