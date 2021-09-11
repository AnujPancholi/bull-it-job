const express = require('express');

module.exports = (deps) => {

    const {
        appLogger,
        db,
    } = deps;

    const app = express();

    app.use(express.json({
        limit: '50mb'
    }))

    app.use((req,res,next) => {
        req.db = db;
        next();
    })

    app.get('/ping',(req,res,next) => {
        appLogger.info(res.locals);

        res.status(200).send();
    })


    

    return app;

}
