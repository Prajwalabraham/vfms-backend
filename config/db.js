const {Pool} = require('pg');

const pool = new Pool({
    user: 'prajwal',
    host: 'localhost',
    database: 'volunteers',
    port: 5432,
    password: 'jehovah1'
  });
  
  pool.connect();

  pool.on('connect', () => {
    console.log('Database Connected');
  });

  module.exports = pool