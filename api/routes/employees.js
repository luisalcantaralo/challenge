var express = require('express');
var router = express.Router();
const {connectionData} = require('../config/db');
const { Client } = require('pg');

// GET all employees
router.get('/', async function(req, res, next) {
  const client = new Client(connectionData)
    client.connect();
    try {
        const data = await client.query('SELECT * FROM employees as e INNER JOIN employeedepartment as ed ON e.employee_id = ed.employee_id INNER JOIN departments as d ON d.department_id = ed.department_id INNER JOIN companies as c ON c.company_id = d.company_id');
        res.status(200).json({ customers: data.rows});

    } catch (error) {
        next({status: 500, message: error.stack});
    } finally{
        client.end();
    }
});

// GET all employees
router.get('/simple', async function(req, res, next) {
    const client = new Client(connectionData)
      client.connect();
      try {
          const data = await client.query('SELECT * FROM employees');
          res.status(200).json({ customers: data.rows});
  
      } catch (error) {
          next({status: 500, message: error.stack});
      } finally{
          client.end();
      }
  });

// GET a single employee given its id
router.get('/:id', async function(req, res, next) {
    const {id} = req.params;
    console.log(req.params);
    const client = new Client(connectionData)
    client.connect();
    try {
        const paramsQuery = [id]; 
        const data = await client.query('SELECT * FROM employees as e INNER JOIN employeedepartment as ed ON e.employee_id = ed.employee_id INNER JOIN departments as d ON d.department_id = ed.department_id INNER JOIN companies as c ON c.company_id = d.company_id WHERE e.employee_id = $1', paramsQuery);
        console.log(typeof data.rows) ;
        if(Object.keys(data.rows).length == 0) res.status(404).json({ message: "No employee found!"});
        else res.status(200).json({ message: data.rows});

    } catch (error) {
        next({status: 500, message: error.stack});
    } finally{
        client.end();
    }
  });

// POST, add new employee to the database
router.post('/', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const { first_name, last_name, phone1, phone2, email, address, city, state, zip} = req.body;
    try {
        console.log(first_name);
        var data = await client.query('INSERT INTO employees(first_name, last_name, phone1, phone2, email, address, city, state, zip) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING employee_id;', [first_name, last_name, phone1, phone2, email, address, city, state, zip]);
        console.log(data.rows);
        res.status(200).json({ data: data.rows, message: "Successful inserting employee"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// POST, assign employee to department in the database
router.post('/department', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const { employee_id, department_id} = req.body;
    try {
        var data = await client.query('INSERT INTO employeedepartment(employee_id, department_id) VALUES($1, $2) RETURNING *;', [employee_id, department_id]);
        console.log(data.rows);
        res.status(200).json({ data: data.rows, message: "Successful inserting employee"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// PUT, update an employee given its id
router.put('/:id', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const {id} = req.params;
    const {first_name, last_name, phone1, phone2, email, address, city, state, zip} = req.body;
    try {
        const data = await client.query('UPDATE employees SET first_name = $2, last_name = $3, phone1 = $4, phone2 = $5, email = $6, address = $7, city = $8, state = $9, zip = $10  WHERE employee_id = $1', [id, first_name, last_name, phone1, phone2, email, address, city, state, zip]);
        console.log(data.rows) ;
        res.status(200).json({ data: data.rows, message: "Successful updating employee"});

    } catch (error) {
        res.status(400).json({ message: "Error with query", error: error});
        
    } finally{
        client.end();
    }
});

// Deletes employee
router.delete('/:id', async(req, res, next) => {
    const client = new Client(connectionData)
    client.connect();
    const {id} = req.params;
    try {
        const data = await client.query(`DELETE FROM employees WHERE employee_id = ${id}`);
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
