const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {Pool} = require('pg');
const dotenv = require('dotenv');
const routeurls = require('./routes/route');
const cors = require('cors');
const path = require('path');
const fs = require('fs')
const https = require('https')

const key = fs.readFileSync('./private.key')
const cert = fs.readFileSync('./certificate.crt')

const cred = {
  key,
  cert
}

dotenv.config()

process.on('uncaughtException', function (err) {
  console.log(err);
});

const pool = new Pool({
   user: process.env.PGUSER,
   password: process.env.PGPASSWORD,
   host: process.env.PGHOST,
   database: process.env.PGDATABASE,
   port: process.env.PGPORT,

  });
  
  pool.connect();

  pool.on('connect', () => {
    console.log('Database Connected');
  });

//app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routeurls);
app.use(express.json({ type: 'application/vnd.api+json' }));
app.use('/app', routeurls)

/*app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
*/
app.listen(process.env.PORT || 4000,() => console.log("server is up and running ", process.env.PORT))


const httpsServer = https.createServer(cred, app)
httpsServer.listen(8443)
