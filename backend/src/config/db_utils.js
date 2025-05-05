const poolPromise  = require("./database");

async function get_database(query, params) {
  try {
    const pool = await poolPromise;  // Ensure pool is initialized
    if (!pool) {
      throw new Error("Database connection pool is not initialized.");
    }
    const [result] = await pool.query(query, params);  // This is correct with promise support
    return result;
  } catch (err) {
    throw new Error(`Error executing get query: ${query}. ${err.message}`);
  }
}

async function post_database(query, params, success_message = "Posted Successfully") {
  try {
    const pool = await poolPromise;  // Ensure pool is initialized
    const [result] = await pool.query(query, params);  // This is also correct
    return { result, message: success_message };
  } catch (err) {
    throw new Error(`Error executing post query: ${query}. ${err.message}`);
  }
}

module.exports = { get_database, post_database };
