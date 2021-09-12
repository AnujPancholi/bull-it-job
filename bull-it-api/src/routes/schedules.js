const express = require("express");
const { getResponseObj } = require("../utils/responseUtils.js");
const { JOBS: JOBS_COLLECTION_NAME, SCHEDULES: SCHEDULES_COLLECTION_NAME } = require("../config.js").COLLECTION_NAMES;
const Joi = require('joi');
const ExtendedError = require('../lib/errors/extendedError.js');

const schedulePayloadSchema = Joi.object({
    jobId: Joi.string().required(),
    schedulingStrategy: Joi.string().required(),
    data: Joi.object().unknown(true).required(),
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
            throw new ExtendedError(`Payload validation failed: ${validationResult.error.message}`,400);
        }

        const jobInfo = await req.db.collection(JOBS_COLLECTION_NAME).findOne({
            _id: payload.jobId,
        })

        if(!jobInfo){
            throw new ExtendedError("Invalid jobId",400);
        }

        if(!jobInfo.schedulingStrategies.includes(payload.schedulingStrategy)){
            throw new ExtendedError("Scheduling Strategy not supported for job",400);
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