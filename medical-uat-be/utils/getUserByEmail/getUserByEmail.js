const pool = require("../../dbConfig/config");

// Check if email exists
const getUserByEmail = async (email) => {
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    // Execute the query
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log(result, "/////// result");
    return result.rows[0];
  } catch (err) {
    console.error('Error fetching user by email:', err.message);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
};

  module.exports = {
    getUserByEmail
  }