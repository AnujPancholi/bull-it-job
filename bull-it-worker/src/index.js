const Queue = require('bull');


const oneTimeJobsQueue = new Queue('one_time_job');