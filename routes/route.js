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
      const sql = "SELECT * FROM main_volunteers WHERE phone = $1"
      pool.query(sql, [phone], (error, results) => {
        if(error){
          console.log(error);
        }
        else{
        //console.log(results.rows[0].team);
        team = results.rows[0].team;
        volunteerName=results.rows[0].name; 
        //Data for name and team obtained from main_volunteers when userPhone==main_volunteers.phone
        

        //Query results being put in the food_preference DB.
        pool.query('INSERT INTO food_preference (name, phone, preference, team, date) VALUES ($1, $2, $3, $4, $5) RETURNING *', [volunteerName, phone, preference, team, createdDate], (error, results) => {
          if (error) {
            throw error
          }
          res.status(201).send("Successfully Submitted")
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
    pool.query('SELECT COUNT(preference) FROM food_preference WHERE preference=$1 UNION SELECT COUNT(preference) FROM food_preference WHERE preference=$2 ',[nonVeg, veg], (error, results) => {
      if (error) {
        throw error
      }
      
      nonVegCount = results.rows[1].count;
      vegCount = results.rows[0].count;
      const count = {
        nonVegCount, vegCount
      }
      console.log(count); 
      
      res.status(201).send(count)
    })
 
});




/*router.post("/signup", async (req, res) => {
  const {username,
    email,
    password} = req.body;
    console.log(username+password+email);

    pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, password], (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send("Successfully Signed Up!")
    })
 
});

router.post("/login", async (req, res) => {
  const {email,
    password} = req.body;

    const loginSql = "SELECT * FROM users WHERE email = $1 AND password = $2"
    pool.query(loginSql, [email, password], (error, results) => {
      if (error) {
        throw error
      }

      email = results.rows[0].email;
      res.status(201).json(email)
    })
 
});
*/



module.exports = router