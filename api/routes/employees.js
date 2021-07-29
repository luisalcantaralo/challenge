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
