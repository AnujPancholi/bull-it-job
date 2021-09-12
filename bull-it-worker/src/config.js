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
  };