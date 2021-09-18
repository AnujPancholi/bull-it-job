const express = require('express');
const { getResponseObj } = require("../utils/responseUtils.js");
const {
    MESSAGES: MESSAGES_COLLECTION_NAME,
} = require('../config.js').COLLECTION_NAMES;



const getMessagesRouter = (deps) => {
    const {
        logger,
    } = deps;

    const messagesRouter = express.Router();

    messagesRouter.get('/',async(req,res,next) => {
        try{   
            const messages = await req.db.collection(MESSAGES_COLLECTION_NAME).find({}).sort({_id:-1}).toArray();

            res.locals.responseObj = getResponseObj(200,{
                messages,
            })
            next();

        }catch(e){
            logger.error(`Error: ${e.message}`);
            next(e);
        }
    })

    return messagesRouter;
}

module.exports = getMessagesRouter;