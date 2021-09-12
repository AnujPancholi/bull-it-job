module.exports = {
    SERVICE_NAME: "bull-it-worker",
    DB_URI: process.env.DB_URI || "",
    DB_NAME: process.env.DB_NAME || "",
    JOB_QUEUE_REDIS_URI: process.env.JOB_QUEUE_REDIS_URI || "",
    DEFAULT_JOB_CONCURRENCY: 5,
    COLLECTION_NAMES: {
      JOBS: "jobs",
      SCHEDULES: "schedules",
      MESSAGES: "messages",
    },
    MAX_CPU_USAGE_THRESHOLD: Math.max(parseFloat(process.env.MAX_CPU_USAGE_THRESHOLD || 70),50),
    CPU_USAGE_MONIT_FREQUENCY: Math.max(parseInt(process.env.CPU_USAGE_MONIT_FREQUENCY || 15000),15000),
  };