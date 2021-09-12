const Queue = require('bull');
const {
    JOB_QUEUE_REDIS_URI
} = require('../../config.js');

const oneTimeJobQueue = new Queue('one-time-jobs', JOB_QUEUE_REDIS_URI);

module.exports = oneTimeJobQueue;