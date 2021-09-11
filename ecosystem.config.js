module.exports = {
  apps : [
  {
    name   : "bull-it-api",
    script : "./bull-it-api/src/index.js",
    env_production: {
      NODE_ENV: "production",
    },
    env_develop: {
      NODE_ENV: "develop",
    }
  },
  {
    name   : "bull-it-worker",
    script : "./bull-it-worker/src/index.js",
    env_production: {
      NODE_ENV: "production",
    },
    env_develop: {
      NODE_ENV: "develop",
    }
  }
]
}
