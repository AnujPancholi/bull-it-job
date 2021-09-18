module.exports = {
  SERVICE_NAME: "bull-it-api",
  PORT: parseInt(process.env.PORT || 3001),
  DB_URI: process.env.DB_URI || "",
  DB_NAME: process.env.DB_NAME || "",
  JOB_QUEUE_REDIS_URI: process.env.JOB_QUEUE_REDIS_URI || "",
  COLLECTION_NAMES: {
    JOBS: "jobs",
    SCHEDULES: "schedules",
    MESSAGES: "messages",
  },
};
