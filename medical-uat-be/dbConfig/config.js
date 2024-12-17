const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const createUsersTable = async () => {
  const query = `
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT CHECK (age >= 0),
    condition VARCHAR(100),
    phone VARCHAR(15),
    address VARCHAR(255),
    dob DATE,
    emergency_contact VARCHAR(100),
    blood_group VARCHAR(3) -- Added blood_group column
);
`;

  try {
    // Connect to the database
    const client = await pool.connect();
    // Execute the query to create the table
    await client.query(query);
    console.log('Table "users" created successfully.');
    // Release the client back to the pool
    client.release();
  } catch (err) {
    console.error('Error creating table "users":', err.message);
  } finally {
    // End the pool connectin
    await pool.end();
  }
};
async function dropEmailColumn() {
  try {
      await pool.connect();

      const dropColumnQuery = `
          ALTER TABLE patients
          DROP COLUMN email;
      `;

      await pool.query(dropColumnQuery);
      console.log("Email column dropped successfully.");

  } catch (err) {
      console.error('Error dropping email column', err.stack);
  } finally {
      await pool.end();
  }
}
async function getColumnNames() {
  const client = await pool.connect();
  try {

      const query = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users';
      `;

      const res = await client.query(query);
      const columnNames = res.rows.map(row => row.column_name);
      console.log("Column names:", columnNames);

  } catch (err) {
      console.error('Error fetching column names', err.stack);
  } finally {
      await client.end();
  }
}
getColumnNames()
// dropEmailColumn()
async function addCreatedReceptionIdColumn() {
  try {
    const client = await pool.connect();

      const addColumnQuery = `
          ALTER TABLE patients
          DELET COLUMN createdReceptionId INT;
      `;

      await client.query(addColumnQuery);
      console.log("Column 'createdReceptionId' added successfully.");

  } catch (err) {
      console.error('Error adding column', err.stack);
  } finally {
      await pool.end();
  }
}
// addCreatedReceptionIdColumn()
// // Call the function to create the table
// createUsersTable();

const addColumnToUsers = async () => {
  const query = `
    ALTER TABLE users 
    ADD COLUMN refreshToken VARCHAR(100);
  `;

  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    // Execute the query to add the column
    await client.query(query);
    console.log('Column "refreshToken" added successfully.');
  } catch (err) {
    console.error('Error adding column to "users":', err.message);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
};
const updateColumnLength = async () => {
  const query = `
    ALTER TABLE users 
    ALTER COLUMN refreshToken TYPE VARCHAR(255);
  `;

  let client;
  try {
    client = await pool.connect();
    await client.query(query);
    console.log('Column "refresh_token" length updated successfully.');
  } catch (err) {
    console.error('Error updating column length:', err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
};
// updateColumnLength()
// Call the function to add the column
// addColumnToUsers();

module.exports = pool