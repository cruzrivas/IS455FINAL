
require("dotenv").config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.CRUNCHY_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  console.log("Successful connection to the database");

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM book";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;
