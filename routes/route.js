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
      const sql = "SELECT * FROM main_volunteers WHERE phone = $1"
      pool.query(sql, [phone], (error, results) => {
        if(error){
          res.write("Your phone number isn't Recorded");
        }
        else{
        //console.log(results.rows[0].team);
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

    }
      }) 
});

router.post("/verify", async (req, res) => {
  const {name,
    phone,
    email} = req.body;
  
  
    console.log(phone);

  const sql = "SELECT * FROM food_preference WHERE phone = $1"
  pool.query(sql, [phone], (error, results)=>{
    if (error) {
      throw error;
    }

    else{

      pool.query('UPDATE food_preference SET taken = true WHERE phone=$1', [phone], (error, results) => {
        if (error) {
          throw error
        }
        console.log("Done");
      })



      res.status(201).send("Verified")
    }
  })
 
});


router.post("/main_volunteers", async (req, res) => {
  const {name,
    team,
    phone,
    email} = req.body;

    pool.query('INSERT INTO main_volunteers (name, team, phone, email) VALUES ($1, $2, $3, $4) RETURNING *', [name, team, phone, email], (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send("Successfully Submitted")
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
    const viewSql = "SELECT COUNT(preference) FROM food_preference WHERE preference=$1 AND date BETWEEN $3 AND $4 UNION SELECT COUNT(preference) FROM food_preference WHERE preference=$2 AND date BETWEEN $3 AND $4"
    pool.query(viewSql,[nonVeg, veg, startDate, endDate], (error, results) => {
      if (error) {
        throw error
      }
      
      nonVegCount = results.rows[1].count;
      vegCount = results.rows[0].count
      const count = {
        nonVegCount, vegCount
      }
      console.log(count); 
      
      res.status(200).send(count)
    })
 
});




router.post("/signup", async (req, res) => {
  const {username,
    email,
    password} = req.body;
    console.log(username+password+email);
    
    const  data  =  await pool.query(`SELECT * FROM users WHERE email= $1;`, [email]); //Checking if user already exists
    const  arr  =  data.rows;
    if (arr.length  !=  0) {
    return  res.status(400).json({
    error: "Email already there, No need to register again.",
    });
  }
  else{

    pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, password], (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send("Successfully Signed Up!")
    })
  }
});

router.post("/login", async (req, res) => {
  const {email,
    password} = req.body;
    
    const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [email]) //Verifying if the user exists in the database
    const user = data.rows;
    if (user.length === 0) {
    res.status(400).json({
    error: "User is not registered, Sign Up first",
    });
    }
    else{
    const loginSql = "SELECT * FROM users WHERE email = $1 AND password = $2"
    pool.query(loginSql, [email, password], (error, results) => {
      if (error) {
        throw error
      }
      console.log(results);
      res.status(200).send("")
    })
  }
});



module.exports = router