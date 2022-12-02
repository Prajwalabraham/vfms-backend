const {Pool} = require('pg');
const dotenv = require('dotenv');


dotenv.config()


const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  password: process.env.PGPASSWORD
  });
  
  pool.connect();

  pool.on('connect', () => {
    console.log('Database Connected');
  });

  module.exports = pool