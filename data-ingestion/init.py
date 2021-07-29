
# encoding: UTF-8
# Author: Luis Alfonso Alcantara
import psycopg2
import csv
from psycopg2 import Error
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT 

# Connects to database or postgres service
def connect_database(database=None):
    try:
        if database != None:
            connection = psycopg2.connect("dbname='challenge' user='postgres' host='db' password='example'")
        else:
            connection = psycopg2.connect("user='postgres' host='db' password='example'")
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        if database == None:
            print("Successfully connected to postgres\n")
        else:
            print("Successfully connected to database:", database, "\n")
        return connection
    except (Exception, Error) as error:
        print("Error while connecting to PostgreSQL", error)
        print("Check postgres is up and running...")
        exit()

# Create the 4 tables defined in the ER Diagram
def config_database(conn):
    cursor = conn.cursor()
    cursor.execute('DROP DATABASE IF EXISTS challenge')
    cursor.execute('CREATE DATABASE challenge')
    cursor.close()
    conn.close()

    conn = connect_database("challenge")
    t = ["employees", "companies", "departments", "employeedepartments"]
    tables = (
        """
        CREATE TABLE employees (
            employee_id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            phone1 VARCHAR(50) NOT NULL,
            phone2 VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            state VARCHAR(2) NOT NULL,
            zip VARCHAR(10) NOT NULL
        )
        """,
        """ CREATE TABLE companies (
                company_id SERIAL PRIMARY KEY,
                company_name VARCHAR(100) NOT NULL
                )
        """,
        """
        CREATE TABLE departments (
                department_id SERIAL PRIMARY KEY,
                department_name VARCHAR(100) NOT NULL,
                company_id INTEGER NOT NULL,
                FOREIGN KEY (company_id)
                REFERENCES companies (company_id)
                ON UPDATE CASCADE ON DELETE CASCADE
        )
        """,
        """
        CREATE TABLE employeedepartment (
                employee_id INTEGER NOT NULL,
                department_id INTEGER NOT NULL,
                PRIMARY KEY (employee_id , department_id),
                FOREIGN KEY (employee_id)
                    REFERENCES employees (employee_id)
                    ON UPDATE CASCADE ON DELETE CASCADE,
                FOREIGN KEY (department_id)
                    REFERENCES departments (department_id)
                    ON UPDATE CASCADE ON DELETE CASCADE
        )
        """)
    cursor = conn.cursor()
    i = 0
    for table in tables:
        print("Creating table", t[i] + "...")
        cursor.execute(table)
        i += 1
    cursor.close()
    return conn

# Validates de state field
def validate_items(items):
    v_items = []
    for i in range(len(items)):
        if len(items[i][5]) != 2:
            print("Record for", items[i][0], items[i][1] + ", invalid state length")
        elif not items[i][5][0].isalpha() or not items[i][5][1].isalpha():
            print("Record for", items[i][0], items[i][1] + ", invalid state (using another character than letters)")
        else:
            v_items.append(items[i])
    return v_items

# Reads the file content and converts it to a list
def read_file(file_name):
    items = []
    with open(file_name, 'r') as file:
        items_csv = csv.reader(file)
        for item in items_csv:
            items.append(item)
        items.pop(0)
        print("Validating items...\n")
        v_items = validate_items(items)
    return v_items

# Get id of employee (or -1)    
def employee_exists(cursor, email):
    cursor.execute("SELECT employee_id FROM employees WHERE email = '" + email+"'")
    if cursor.rowcount == 0:
        return -1
    return cursor.fetchone()[0]

# Get id of company (or -1)    
def company_exists(cursor, company_name):
    cursor.execute("SELECT company_id FROM companies WHERE company_name = '" + company_name+"'")
    if cursor.rowcount == 0:
        return -1
    return cursor.fetchone()[0]

# Get id of department (or -1) 
def department_exists(cursor, department_name, company_id):
    cursor.execute("SELECT department_id FROM departments WHERE department_name = '" + department_name+"' AND company_id = " + str(company_id))
    if cursor.rowcount == 0:
        return -1
    return cursor.fetchone()[0]

# Answers if there is a record with employee working in department (or -1) 
def employee_in_department(cursor, employee_id, department_id):
    cursor.execute("SELECT employee_id FROM employeedepartment WHERE employee_id = " + str(employee_id)+" AND department_id = " + str(department_id))
    if cursor.rowcount == 0:
        return -1
    return cursor.fetchone()[0]  

# Adds new record for employee
def insert_employee(cursor, item):
    first_name = item[0]
    last_name = item[1]
    address  = item[3]
    city  = item[4]
    state  = item[5]
    zip  = item[6]
    phone1  = item[7]
    phone2  = item[8]
    email = item[9]

    employee_id = employee_exists(cursor, email)
    if employee_id != -1:
        print("Employee", first_name, last_name, "already exists. ")
        return employee_id
    else:
        new_employee_sql = """INSERT INTO employees(first_name, last_name, phone1, phone2, email, address, city, state, zip) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING employee_id;"""
        cursor.execute(new_employee_sql, (first_name, last_name, phone1, phone2, email, address, city, state, zip))
        return cursor.fetchone()[0]

# Adds new record for company
def insert_company(cursor, item):
    company_name = item[2]
    company_id = company_exists(cursor, company_name)
    if company_id !=  -1:
        print("Company", company_name, "already exists. \n")
        # TODO if company repeats
        return company_id
    else:
        new_company_sql = "INSERT INTO companies(company_name) VALUES('"+ company_name+"') RETURNING company_id;"
        cursor.execute(new_company_sql)
        return cursor.fetchone()[0]

# Adds new record for department
def insert_department(cursor, company_id, department_name):
    department_id = department_exists(cursor, department_name, company_id)
    if department_id != -1:
        print("Department", department_name, "already exists. \n")
        return department_id
    else:
        new_department_sql = "INSERT INTO departments(department_name, company_id) VALUES('"+ department_name+"', "+ str(company_id) + ") RETURNING company_id;"
        cursor.execute(new_department_sql)
        return cursor.fetchone()[0]

# Adds new record for employeedepartment
def insert_employee_department(cursor, employee_id, department_id):
    employee_department = employee_in_department(cursor, employee_id, department_id)
    if employee_department != -1:
        print("Employee number", employee_id, "already works there. \n")
        return employee_department
    else:
        new_department_sql = "INSERT INTO employeedepartment(employee_id, department_id) VALUES("+ str(employee_id)+", "+ str(department_id) + ") RETURNING employee_id;"
        cursor.execute(new_department_sql)
        return cursor.fetchone()[0]

# Controls the order of the data inserted
def insert_data(conn, items):
    cursor = conn.cursor()
    for item in items:
        employee_id =  insert_employee(cursor, item)
        company_id = insert_company(cursor, item)
        department_id = insert_department(cursor, company_id, item[10])
        insert_employee_department(cursor, employee_id, department_id)
    cursor.close()

# Main function, shows user current state      
def main():
    print("Initial script starting to execute...")
    print("Checking connection to postgres...\n")
    test_conn = connect_database()

    print("Deleting previous items in database...")
    conn = config_database(test_conn)

    print("\nReading file (sample.csv)...")
    items = read_file("sample.csv")

    print("Inserting items to database...\n")
    insert_data(conn, items)
    print("\nDone!")

main()