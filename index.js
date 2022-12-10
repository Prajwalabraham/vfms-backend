const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {Pool} = require('pg');
const dotenv = require('dotenv');
const routeurls = require('./routes/route');
const cors = require('cors');
const path = require('path');

dotenv.config()

const pool = new Pool({
   user: process.env.PGUSER,
   password: process.env.PGPASSWORD,
   host: process.env.PGHOST,
   database: process.env.PGDATABASE,
   port: process.env.PGPORT,

  });
  
  pool.connect();

  pool.on('connect', () => {
    try {
      console.log('Database Connected');  
    } catch (error) {
      next(error)
    }
    
  });

//app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routeurls);
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use(cors());
    
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/app', routeurls)

/*app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
*/
app.listen(4000,() => console.log("server is up and running"))


