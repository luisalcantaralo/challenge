const { Client } = require('pg');

const connectionData = "postgresql://postgres:example@db/challenge"

const client = new Client(connectionData)

const checkConnection = (client) =>  (req, res, next) => {
  if (client.ended) {
    client.connect();
  } 
  next()
}

module.exports = {connectionData};
