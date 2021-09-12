const express = require("express");
const { getResponseObj } = require("../utils/responseUtils.js");
const { JOBS: JOBS_COLLECTION_NAME, SCHEDULES: SCHEDULES_COLLECTION_NAME } = require("../config.js").COLLECTION_NAMES;
const Joi = require('joi');

const schedulePayloadSchema = Joi.object({
    jobId: Joi.string(),
    schedulingStrategy: Joi.string(),
    data: Joi.object().unknown(true),
})



const getSchedulesRouter = (deps) => {
 const {
     logger,
     schedulers,
 } = deps;

 const schedulesRouter = express.Router();

 schedulesRouter.post('/add',async(req,res,next) => {
    
    const payload = req.body;

    try {

        const validationResult = schedulePayloadSchema.validate(payload);
        if(validationResult.error){
            throw new Error("Payload validation failed");
        }

        const jobInfo = await req.db.collection(JOBS_COLLECTION_NAME).findOne({
            _id: payload.jobId,
        })

        if(!jobInfo){
            throw new Error("Invalid jobId");
        }

        if(!jobInfo.schedulingStrategies.includes(payload.schedulingStrategy)){
            throw new Error("Scheduling Strategy not supported for job");
        }

        const schedulerFunction = schedulers[payload.schedulingStrategy] || schedulers['DEFAULT#'];

        const schedulingResult = await schedulerFunction(payload.jobId,payload.data);

        res.locals.responseObj = getResponseObj(200,{
            message: "Job Scheduled",
            scheduleId: schedulingResult.scheduleId,
        })

        next();

    } catch(e) {
        logger.error(`${e.message || "An error occurred"}`);
        next(e);
    }

 })

 return schedulesRouter;

}

module.exports = getSchedulesRouter;