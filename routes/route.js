const { application } = require('express')
const express = require('express')
const router = express.Router() 
const pool = require('../config/db');

router.post("/foodPreference", async (req, res) => {

      // Get user input
      const { name,
        phone,
        preference} = req.body;
      const createdDate = new Date()
      let team;
      let volunteerName;
      const dt = new Date()    
      const startWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
      const startDate = new Date( dt.setDate(startWeek))
      const endDate = new Date()
      const sql = "SELECT EXISTS(SELECT * FROM main_volunteers WHERE phone = $1)"
      pool.query(sql, [phone], (error, results) => {
        if(results.rows[0].exists){
        //console.log(results.rows[0].team);
        pool.query("SELECT * FROM main_volunteers WHERE phone = $1", [phone], (error, results) => {
        console.log(startDate);
        team = results.rows[0].team;
        volunteerName=results.rows[0].name; 
        pool.query("SELECT EXISTS(SELECT * FROM food_preference WHERE phone=$1 AND date BETWEEN $2 AND $3)", [phone, startDate, endDate], (error, results)=>{
        if(results.rows[0].exists){ 
          //Query results being put in the food_preference DB.
          res.status(406).send("Duplicate")
          console.log(results.rows[0].exists);
        }
        
        else{
          pool.query('INSERT INTO food_preference (name, phone, preference, team, date) VALUES ($1, $2, $3, $4, $5) RETURNING *', [volunteerName, phone, preference, team, createdDate], (error, results) => {
            if (error) {
              console.log(error);
            }
            res.status(201).send("Successfully Submitted")
          })
          
          console.log(results.rows[0].exists);
        }
        
        })
          
      })

      }
      else{
        res.status(403).send("Redirect to /QR");
      }
      }) 
});

router.post("/verify", async (req, res) => {
  const name = req.body.state.name
  const email = req.body.state.email
  const phone = req.body.state.phone
  const team = req.body.team
  
    const dt = new Date()    
    const startWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
    const startDate = new Date( dt.setDate(startWeek))
    const endDate = new Date()
    console.log(phone);

  const sql = "SELECT EXISTS(SELECT * FROM food_preference WHERE phone = $1 AND date BETWEEN $2 AND $3 )"
  pool.query(sql, [phone, startWeek, endWeek], (error, results)=>{
    if (results.rows[0].exists) {
      pool.query('UPDATE food_preference SET taken = true WHERE phone=$1 AND date BETWEEN $4 AND $3', [phone, startWeek, endWeek], (error, results) => {
        if (error) {
          throw error
        }
        console.log("Done");
      })



      res.status(201).send("Verified")
    }

    else{
      res.status(400).send("Data Not Found!!")
    }
  })
 
});


router.post("/main_volunteers", async (req, res) => {
  const name = req.body.state.name
  const email = req.body.state.email
  const phone = req.body.state.phone
  const team = req.body.team
  console.log(name, email,phone,team);  

    pool.query('SELECT EXISTS(SELECT * FROM main_volunteers WHERE phone=$1 OR email=$2)', [phone, email], (error, results) => {
      if(results.rows[0].exists){ 
        res.status(406).send("Duplicate")
        console.log(results.rows[0].exists);
      }
      else{
        pool.query('INSERT INTO main_volunteers (name, team, phone, email) VALUES ($1, $2, $3, $4) RETURNING *', [name, team, phone, email], (error, results) => {
          if (error) {
            throw error
          }
          res.status(201).send("Successfully Submitted")
        })
      }
    })

  
 
});


router.post("/viewKitchen", async (req, res) => {
    const nonVeg = 'NON-VEG'
    const veg = 'VEG'
    let nonVegCount
    let vegCount
    const dt = new Date()    
    const startWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
    const startDate = new Date( dt.setDate(startWeek))
    const endDate = new Date()
    const viewSql = "SELECT (SELECT COUNT(preference) FROM food_preference WHERE preference=$1 AND date BETWEEN $3 AND $4) AS NonVegCount, (SELECT COUNT(preference) FROM food_preference WHERE preference=$2 AND date BETWEEN $3 AND $4) AS vegCount, (SELECT COUNT(preference) FROM food_preference WHERE preference=$1 AND taken = true AND date BETWEEN $3 AND $4) AS verifiedNV,( SELECT COUNT(preference) FROM food_preference WHERE preference=$2 AND taken = true AND date BETWEEN $3 AND $4)AS verifiedV"
    pool.query(viewSql,[nonVeg, veg, startDate, endDate], (error, results) => {
      if (error) {
        throw error
      }
      nonVegCount = results.rows[0].nonvegcount;
      vegCount = results.rows[0].vegcount
      recNonVeg = results.rows[0].verifiednv
      recVeg = results.rows[0].verifiedv

     
      
      const count = {
        nonVegCount, vegCount, recNonVeg, recVeg
      }
      console.log(results);
       
      console.log(count);
      res.status(200).send(count)
    })
 
});


router.post("/viewDetailedKitchen", async (req, res) => {
  const nonVeg = 'NON-VEG'
  const veg = 'VEG'
  let nonVegCount
  let vegCount
  const team = 'greeters'
  const dt = new Date()    
  const startWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
  const startDate = new Date( dt.setDate(startWeek))
  const endDate = new Date()
  const greetersSql = "SELECT (SELECT COUNT(preference) FROM food_preference WHERE preference=$1 AND date BETWEEN $3 AND $4 AND team = $5) AS NonVegCount, (SELECT COUNT(preference) FROM food_preference WHERE preference=$2 AND date BETWEEN $3 AND $4 AND team=$5 ) AS vegCount, (SELECT COUNT(preference) FROM food_preference WHERE preference=$1 AND taken = true AND date BETWEEN $3 AND $4 AND team=$5) AS verifiedNV,( SELECT COUNT(preference) FROM food_preference WHERE preference=$2 AND taken = true AND date BETWEEN $3 AND $4 AND team=$5)AS verifiedV"
  try {
    await pool.query('BEGIN')
    pool.query(viewSql,[nonVeg, veg, startDate, endDate, team], (error, results) => {
      if (error) {
        throw error
      }
      console.log(results);
       
    })
    
  } catch (error) {
    
  }
  


});




router.post("/signup", async (req, res) => {
  const {username,
    email,
    password} = req.body;

    pool.query("SELECT EXISTS(SELECT * FROM users WHERE email= $1)", [email], (error ,results) => {
      if (results.rows[0].exists) {
        res.status(400).json({
          error: "User is already registered"
        })
      }//Checking if user already exists
  else{

    pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password], (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send("Successfully Signed Up!")
    })
  }
  }); 
});

router.post("/login", async (req, res) => {
  const {email,
    password} = req.body;
    
    pool.query("SELECT EXISTS(SELECT * FROM users WHERE email= $1)", [email], (error, results) => {
      if(results.rows[0].exists){ 
        const loginSql = "SELECT * FROM users WHERE email = $1 AND password = $2"
        pool.query(loginSql, [email, password], (error, results) => {
          if (error) {
            throw error
          }
          else if (results.rowCount != 0) {
          console.log(results);
          if (results.rows[0].email==email && results.rows[0].password==password) {
            
          res.status(200).send("")
          }
          else{
            console.log(error);
          }
          }
          
          else{

            res.status(403).send("Email or Password Incorrect")
          }
        })
      }
      else{
        res.status(401).send("User Doesn't exists")
      } 
    }) //Verifying if the user exists in the database
});



module.exports = router