const getUsageStats = require('pidusage');
const logger = require('../../../bull-it-api/src/utils/logger');


const cpuUsageMonitProcess = ({
    MAX_CPU_USAGE_THRESHOLD,
    CPU_USAGE_MONIT_FREQUENCY,
    logger,
}) => {


    const pollCpu = async() => {
        logger.info(`Polling CPU...`);
        try{
            const {cpu} = await getUsageStats(process.pid);
            logger.info(`CPU Usage for current process(pid:${process.pid}): ${cpu}%`);

            if(cpu>MAX_CPU_USAGE_THRESHOLD){
                logger.error(`CPU USAGE (${cpu}) EXCEEDED THRESHOLD (${MAX_CPU_USAGE_THRESHOLD})`);
                process.exit(1)
            }
        } catch(e) {
            logger.error(`Error in fetching CPU usage: ${e.message}`);
        }

        setTimeout(pollCpu,CPU_USAGE_MONIT_FREQUENCY);
        return;
    }

    return pollCpu;
}


module.exports = cpuUsageMonitProcess;

