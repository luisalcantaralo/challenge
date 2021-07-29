var express = require('express');
var router = express.Router();
const {connectionData} = require('../config/db');
const { Client } = require('pg');

// GET all companies
router.get('/', async function(req, res, next) {
  const client = new Client(connectionData)
    client.connect();
    try {
        const data = await client.query('SELECT * FROM companies');
        res.status(200).json({ customers: data.rows});

    } catch (error) {
        next({status: 500, message: error.stack});
    } finally{
        client.end();
    }
});

// GET a single company given its id
router.get('/:id', async function(req, res, next) {
    const {id} = req.params;
    console.log(req.params);
    const client = new Client(connectionData)
    client.connect();
    try {
        const paramsQuery = [id]; 
        const data = await client.query('SELECT * FROM companies WHERE company_id = $1', paramsQuery);
        console.log(data.rows) ;
        if(Object.keys(data.rows).length == 0) res.status(404).json({ message: "No company found!"});
        else res.status(200).json({ message: data.rows});

    } catch (error) {
        next({status: 500, message: error.stack});
    } finally{
        client.end();
    }
  });

module.exports = router;
