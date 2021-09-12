# BullIt Job

*(WIP)*

A simple job scheduler + API powered by [Bull](https://github.com/OptimalBits/bull).

Don't know what to do with a job? Bull it!

## Prerequisites

Yes I could've dockerized this but for certain reasons I didn't. Therefore it must be manually ensured that:

 - The processes can connect to some instance of redis (just install and run redis-server locally, with `sudo apt update` and `sudo apt install redis-server` if you're on Ubuntu).

 - The necessary `.env` files in both `./bull-it-api` and `./bull-it-worker`. The `.env` files don't come included (for obvious reasons) but they need some inportant env vars to run (mostly for connecting to DB).

 - [PM2](https://pm2.keymetrics.io/) installed globally (you can just copy the command from the link).

 - Internet access to connect with the db cluster/redis server (unless you're running literally everything locally).

## Starting Up and Shutting Down

Two scripts to do that, quite simple and self-explanatory.