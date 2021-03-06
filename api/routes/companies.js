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

// POST, add new company to the database
router.post('/', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const { company_name } = req.body;
    try {
        console.log(first_name);
        var data = await client.query('INSERT INTO companies(company_name) VALUES($1) RETURNING employee_id;', [company_name]);
        console.log(data.rows);
        res.status(200).json({ data: data.rows, message: "Successful inserting company"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// PUT, update a company given its id
router.put('/:id', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const {id} = req.params;
    const {company_name} = req.body;
    try {
        const data = await client.query('UPDATE companies SET company_name = $2 WHERE employee_id = $1', [id, company_name]);
        console.log(data.rows) ;
        res.status(200).json({ data: data.rows, message: "Successful updating company"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// Deletes company
router.delete('/:id', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const {id} = req.params;
    try {
        const data = await client.query(`DELETE FROM companies WHERE company_id = ${id}`);
        console.log(data.rows) ;
        res.status(200).json({ message: "Successful deleting item", data: data.rows});

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

module.exports = router;
