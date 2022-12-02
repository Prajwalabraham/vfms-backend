const { application } = require('express')
const express = require('express')
const router = express.Router() 
const pool = require('../config/db');

router.post("/foodPreference", async (req, res) => {

      // Get user input
      const { name,
        phone,
        preference} = req.body;
      
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
        pool.query('INSERT INTO food_preference (name, phone, preference, team) VALUES ($1, $2, $3, $4) RETURNING *', [volunteerName, phone, preference, team], (error, results) => {
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

      pool.query('UPDATE food_preference SET taken = true WHERE phone =$1', [phone], (error, results) => {
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




module.exports = router