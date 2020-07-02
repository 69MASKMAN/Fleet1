/**********************************************************
Project Goal : To provide cutting edge solution for efficient management of the vehicles
Project Starting Date : 09/06/2020
Technology Stack : Front End ( HTML,CSS,BootStrap )
                   Back End ( Nodejs )
                   Database ( Firebase Realtime db, MongoDB db* )
Developing Team : 1. Aadarsh Kumar Sah
                  2. Nitish Mishra
                  3. Asif Khan
                  4. Ashutosh Kumar

*********************************************************/


//------- For securing API key and credentials ---------//
require('dotenv').config()

//------ Importing firebase modules --------------------//
const firebase = require('firebase/app');

//-----  Adding required features ---------------------//
require('firebase/auth');
require('firebase/database');



//----------  TODO: Replace the following with your app's Firebase project configuration -------//
//----------  Your web app's Firebase configuration   ------------------------------------------//
var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};



//----------- Initialize Firebase ----------//
firebase.initializeApp(firebaseConfig);

//-------- Making auth reference  -----------//
const auth = firebase.auth();

//-------- Getting database reference -------//
var db = firebase.database();


//---------- Requiring npm modules  ---------//

const express = require('express');
const ejs = require('ejs');
const path = require('path')
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');


//---------- Mongoose DataBase model Creation ------------------------------------//

//connecting to the database
mongoose.connect("mongodb+srv://admin:admin_hacker@cluster0.dxaot.mongodb.net/companyDB", {useNewUrlParser : true, useUnifiedTopology:true});
//for removing deprication error
mongoose.set("useCreateIndex", true);

//Schema creation
const companySchema = new mongoose.Schema({
  companyName : String,
  companyEmail : String,
  contactDetail : Number,
  companyAddress : String
});

const driverSchema = new mongoose.Schema({
  firstName: String,
  createdOn: String,
  contactNumber: String,
  licenceNo: String,
  address: String,
  email : String,
  companyEmail : String
});

//model creation
const Company = mongoose.model("Company", companySchema);
const Driver = mongoose.model("Driver", driverSchema);

//-------------------------------------------------------------------------------//



//--------  Inclusion of features  ---------//

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({
  extended: true
}));

//-------- Global variable ------------------//
//------ For Reading driver List ------------//
var my_driver = [];
var userID;
var email;
var flag = false;


//------------   Handling all the get request ---------------//

//-------------  Route for Home Page  ----------------------//
app.get("/", (req, res) => {
  res.render("home");
});


//-------------  Route for Login Page  ----------------------//
app.get("/login", (req, res) => {
  res.render("login");
});


//------------ Route for User Login --------------------------//
app.get("/user_login1", (req, res) => {
  res.render("user_login1",{
    message : flag
  });
});


//----------- Route for Admin Login --------------------------//
app.get("/admin_login1", (req, res) => {
  res.render("admin_login1");
});


//----------- Route for Admin Page ----------------------------//
app.get('/admin_page', (req, res) => {
  res.render('admin_page');
});


//----------- Route for User Page after Login -----------------//
app.get('/user_page', (req, res) => {

  //Reading essential information from mongo DataBase
  Company.find( {"companyEmail" : email }, function(err,company){


      console.log(company[0].companyName);

      res.render('user_page', {
        companyName : company[0].companyName,
        companyEmail : company[0].companyEmail,
        companyContact : company[0].contactDetail
      });

  });

});


//-------- Route for Signup page ------------------------------//
app.get("/signup1", (req, res) => {
  res.render("signup1");
});


//-------- Route for MY_Drivers after User_page
app.get('/my_drivers', (req, res) => {

  my_driver = [];
  Driver.find( {}, function(err,drivers){

      drivers.forEach( (driver)=>{

        if(driver.companyEmail !== email ){
          return;
        }

        console.log(driver.firstName);

        //creating a obj of a driver
                var new_driver = {
                  firstName: driver.firstName,
                  createdOn: driver.createdOn,
                  contactNumber: driver.contactNumber,
                  licenceNo: driver.licenceNo,
                  email: driver.email,
                  address : driver.address
                }

                //adding the driver in the array
                my_driver.push(new_driver);

      });

      res.render('my_drivers', {
        driverArray : my_driver,
        message : flag
      });
  });

});

//------- Route for contact_us --------------------------------//
app.get('/contact_us', (req, res) => {
  res.render('contact_us');
});

app.get('/delete_driver/:driverEmail', (req,res)=>{


      Driver.deleteOne( { email : req.params.driverEmail }, function (err) {

        if(err) console.log(err);
        console.log("Successful deletion");

   });

   setTimeout(function(){

     my_driver = [];
     Driver.find( {}, function(err,drivers){

         drivers.forEach( (driver)=>{

           if(driver.companyEmail !== email ){
             return;
           }

           console.log(driver.firstName);

           //creating a obj of a driver
                   var new_driver = {
                     firstName: driver.firstName,
                     createdOn: driver.createdOn,
                     contactNumber: driver.contactNumber,
                     licenceNo: driver.licenceNo,
                     email: driver.email,
                     address : driver.address
                   }
                   //adding the driver in the array
                   my_driver.push(new_driver);

         });

         res.render('my_drivers', {
           driverArray : my_driver
         });
     });

    }, 3000);


});

//--------- Handling all the post request ---------------------------------------------------//

//---------    POST Request For Login method ------------------------------------------------//

app.post("/login", (req, res) => {

  email = req.body.username;
  var password = req.body.password;

 //checking whether the user is registered OR not
  Company.find( {"companyEmail" : email}, function(err,company){

      if(company.length === 0){
        console.log("User Not found");
        flag = true;
        res.redirect('/user_login1');
      } else {

      console.log(company);

      const promise = auth.signInWithEmailAndPassword(email, password);
      promise.catch(e => alert(e.message));

      res.redirect('/user_page');
      console.log("User Found");
    }

  });

});


//--------------------------------    POST Request For Signup method -------------------------------------------//

app.post('/signup', (req, res) => {

  email = req.body.username;
  var password = req.body.password;
  var company = req.body.companyName;

  // Create user with email and pass.
  // [START createUserwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      console.log('The password is too weak.');
    } else {
      console.log("Hello1" + errorMessage);
    }
    console.log("Hello2" + error);
  });

  //Removing the . from Email
  var updatedEmail = "";
  for(var i=0;i<email.length;i++){

     if(email[i] === '.'){
       continue;
     }
     updatedEmail = updatedEmail + email[i];
  }

  console.log(updatedEmail);

   //making custom routes during registering
   //storing company in the firebase database
       db.ref(updatedEmail).set({
         contactDetail: req.body.contactDetails,
         companyName: req.body.companyName
       });


       //storing company data in the mongo database
       var newCompany = new Company({
          companyName : req.body.companyName,
          contactDetail : req.body.contactDetails,
          companyEmail : req.body.username,
          companyAddress : "null"
       });
      //saving into the database
       newCompany.save();


  res.redirect('/user_page');

});


//------------------------------------    POST Request For Admin Route ---------------------------------------------//

app.post('/admin_login1', (req, res) => {

       email = req.body.username;
  var password = req.body.password;

  console.log(email);

  const promise = auth.signInWithEmailAndPassword(email, password);
  promise.catch(e => alert(e.message));

  res.redirect('/admin_page');

});


//--------- POST Request Signout User --------------------------------------------------//

app.post('/signout', (req, res) => {

 //clearing the array
  my_driver = [];

  //sign out the user
  auth.signOut();
  res.redirect('/');
});

//-------------------- POST Request for storing the driver data -------------------------------------//
app.post('/my_drivers', (req, res) => {

     var driverEmail = req.body.email;
     //updating driverEmail
     var updateDriverEmail = "";
     for(var i=0;i<driverEmail.length;i++){

       if(driverEmail[i] === '.'){
         continue;
       }
       updateDriverEmail = updateDriverEmail + driverEmail[i];
     }

     var day = new Date();

     var password = "_hacker"+day.getDay()+day.getMonth()+day.getFullYear();
     console.log(driverEmail);
     console.log(password);

     //sending credentials to the driver's Email
     // using Twilio SendGrid's v3 Node.js Library
     // https://github.com/sendgrid/sendgrid-nodejs
     sgMail.setApiKey('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');
     const msg = {
       to: driverEmail,
       from: 'Aadarshsah02@gmail.com',
       subject: 'credentials : OBD Solutions',
       text: 'Hello!',
       html: '<strong>Your Password :</strong><p>'+ password +'</p>'+'<br/>Username will be your registered Email-id',
     };
     sgMail.send(msg);


     firebase.auth().createUserWithEmailAndPassword(driverEmail, password).catch(function(error) {
       // Handle Errors here.
       var errorCode = error.code;
       var errorMessage = error.message;
      });


      //Check whether any field is empty or not
      if(req.body.firstName === ""  || req.body.phoneNo === ""  || req.body.licenceNo === ""  ||
          req.body.address === ""  ||  req.body.email === "" ){

                 res.redirect('/my_drivers');
                 flag = true;
          } else {


     //Adding the driver in the company list
      var day = new Date();

      db.ref('/drivers/' + updateDriverEmail).set({
        firstName: req.body.firstName,
        createdOn: day.getDay() + "/" + day.getMonth() + "/" + day.getFullYear(),
        contactNumber: req.body.phoneNo,
        licenceNo: req.body.licenceNo,
        address: req.body.address,
        email : req.body.email
      });


      //storing data in the mongo database
      const newDriver = new Driver({
        firstName: req.body.firstName,
        createdOn: day.getDay() + "/" + day.getMonth() + "/" + day.getFullYear(),
        contactNumber: req.body.phoneNo,
        licenceNo: req.body.licenceNo,
        address: req.body.address,
        email : req.body.email,
        companyEmail : email
      });

      newDriver.save();
      res.redirect('/my_drivers');
    }

});


//---------  Listener for the our hosted server ----------------------------------------//

app.listen(3000, () => {
  console.log("Server Started on port 3000");
});
