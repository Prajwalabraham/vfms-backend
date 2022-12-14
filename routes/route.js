const { application } = require('express')
const express = require('express')
const router = express.Router() 
const pool = require('../config/db');
const nodemailer = require('nodemailer')

router.post("/foodPreference", async (req, res) => {

      // Get user input
      const { name,
        phone,
        preference} = req.body;
      const createdDate = new Date()
      let team;
      let volunteerName;
      const taken = false
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
          pool.query('INSERT INTO food_preference (name, phone, preference, team, taken, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [volunteerName, phone, preference, team, taken, createdDate], (error, results) => {
            if (error) {
              console.log(error);
            }
            res.status(201).send("Successfully Submitted")
          })
          
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

  const phone = req.body.state.phone
  
  
    const dt = new Date()    
    const startWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
    const startDate = new Date( dt.setDate(startWeek))
    const endDate = new Date()

  const sql = "SELECT * FROM food_preference WHERE phone = $1 AND date BETWEEN $2 AND $3"
  pool.query(sql, [phone, startDate, endDate], (error, results)=>{
    if (results.rows[0]) {
      const resName = results.rows[0].name
      const resTaken = results.rows[0].taken
      const resPreference = results.rows[0].preference
      const resTeam = results.rows[0].team
      pool.query('SELECT EXISTS(SELECT * FROM food_preference WHERE phone=$1 AND taken = true AND date BETWEEN $2 AND $3)', [phone, startDate,endDate], (error, results) => {
        if (results.rows[0].exists) {
          res.status(401).json({resName, resTaken, resPreference, resTeam})
        }
        else{
        pool.query('UPDATE food_preference SET taken = true WHERE phone=$1 AND date BETWEEN $2 AND $3', [phone, startDate, endDate], (error, results) => {
          if (error) {
            throw error
          }
            console.log(results);
            res.status(201).json({resName, resTaken, resPreference, resTeam})
        })
      }
      })
      
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
    const viewSql = "SELECT * FROM food_preference WHERE date BETWEEN $1 AND $2"
    pool.query(viewSql,[startDate, endDate], (error, results) => {
      if (error) {
        throw error
      }
      console.log(results);
      res.status(200).send(results)
    })
 
});


router.get("/viewDetailedKitchen", async (req, res) => {
  const nonVeg = 'NON-VEG'
  const veg = 'VEG'
  let nonVegCount
  let vegCount
  const team = 'greeters'
  const dt = new Date()    
  const startWeek = dt.getDate() - dt.getDay() + (dt.getDay() === 0 ? -6 : 1)
  const startDate = new Date( dt.setDate(startWeek))
  const endDate = new Date()
  const greetersSql = "SELECT * FROM food_preference WHERE date BETWEEN $1 AND $2"
  try {
    await pool.query('BEGIN')
    pool.query(greetersSql,[startDate, endDate], (error, results) => {
      if (error) {
        throw error
      }
      console.log(results);
      res.status(200).json(results)
       
    })
    
  } catch (error) {
    console.log(error);
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

router.get("/", async(req, res) => {
  res.status(200).send("okkkkkkkkkkkkkkkkkk")
})



module.exports = router