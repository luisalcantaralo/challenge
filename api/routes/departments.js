var express = require('express');
var router = express.Router();
const {connectionData} = require('../config/db');
const { Client } = require('pg');

// GET all departments
router.get('/', async function(req, res, next) {
  const client = new Client(connectionData)
    client.connect();
    try {
        const data = await client.query('SELECT * FROM departments');
        res.status(200).json({ customers: data.rows});

    } catch (error) {
        next({status: 500, message: error.stack});
    } finally{
        client.end();
    }
});

// GET all departments by company id
router.get('/company/:id', async function(req, res, next) {
    const client = new Client(connectionData)
    const {id} = req.params;
    console.log(req.params);
      client.connect();
      try {
        const data = await client.query('SELECT * FROM departments WHERE company_id = $1', [id]);
          res.status(200).json({ customers: data.rows});
  
      } catch (error) {
          next({status: 500, message: error.stack});
      } finally{
          client.end();
      }
  });

// GET departments by id
router.get('/:id', async function(req, res, next) {
    const {id} = req.params;
    console.log(req.params);
    const client = new Client(connectionData)
    client.connect();
    try {
        const paramsQuery = [id]; 
        const data = await client.query('SELECT * FROM departments WHERE department_id = $1', paramsQuery);
        console.log(data.rows) ;
        if(Object.keys(data.rows).length == 0) res.status(404).json({ message: "No company found!"});
        else res.status(200).json({ message: data.rows});

    } catch (error) {
        next({status: 500, message: error.stack});
    } finally{
        client.end();
    }
  });

// POST, add new department to the database
router.post('/', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const { company_id, department_name } = req.body;
    try {
        var data = await client.query('INSERT INTO departments(company_id, department_name) VALUES($1, $2) RETURNING department_id;', [company_id, department_name]);
        console.log(data.rows);
        res.status(200).json({ data: data.rows, message: "Successful inserting department"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// PUT, update a department given its id
router.put('/:id', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const {id} = req.params;
    const {company_id, department_name} = req.body;
    try {
        const data = await client.query('UPDATE departments SET company_id = $2, department_name = $3 WHERE department_id = $1', [id, company_id, department_name]);
        console.log(data.rows) ;
        res.status(200).json({ data: data.rows, message: "Successful updating department"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// Deletes department
router.delete('/:id', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const {id} = req.params;
    try {
        const data = await client.query(`DELETE FROM departments WHERE department_id = ${id}`);
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
