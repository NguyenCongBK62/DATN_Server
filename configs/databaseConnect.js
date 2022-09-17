const Pool = require("pg").Pool;
const pool = new Pool({
  user: "",
  host: "127.0.0.1",
  database: "gr1_test",
  password: "",
  port: 5432,
});

module.exports = pool;
