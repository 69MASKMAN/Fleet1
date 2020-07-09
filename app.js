/**********************************************************
Project Goal : To provide cutting edge solution for efficient management of the vehicles
Project Starting Date : 09/06/2020
Technology Stack : Front End ( HTML,CSS,BootStrap )
                   Back End ( Nodejs )
                   Database ( Firebase Realtime db, MongoDB db* )
Developing Team : 1. Aadarsh Kumar Sah
                  2. Nitish Kumar Mishra
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
const axios = require('axios');


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
  companyEmail : String,
  driver_dp: String
});

//model creation
const Company = mongoose.model("Company", companySchema);
const Driver = mongoose.model("Driver", driverSchema);

//-------------------------------------------------------------------------------//



//--------  Inclusion of features  ---------//

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public/driver_dp")));
app.use(bodyParser.urlencoded({
  extended: true
}));

//-------- Global variable ------------------//
//------ For Reading driver List ------------//
var my_driver = [];
var driver_place = [];
var userID;
var email;
var flag = false;

//----------- Global Function ----------------//
function NewEmail(d_email){

  var updatedEmail = "";

  for(var i=0;i<d_email.length;i++){

     if(d_email[i] === '.'){
       continue;
     }
     updatedEmail = updatedEmail + d_email[i];
  }
  return updatedEmail;
}


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
                  address : driver.address,
                  driver_dp:driver.driver_dp
                }
               
                      
                //adding the driver in the array
                my_driver.push(new_driver);
         });
         console.log(my_driver)
        



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


//--------- Route for deleting the driver -----------------------//

app.get('/delete_driver/:driverEmail', (req,res)=>{


      //deleting driver record from mongo database
      Driver.deleteOne( { email : req.params.driverEmail }, function (err) {

        if(err) console.log(err);
        console.log("Successful deletion");

     });


    //deleting driver record from realtime firebase database
    var driverE = req.params.driverEmail;

    //Removing the . from Email
    var updatedEmail = NewEmail(driverE);

    console.log(updatedEmail);
    db.ref('/drivers/' + updatedEmail).remove();



   //providing 3 seconds delay so that DataBase can get updated
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

//---------- Get Request for getting place of the driver -----------//
app.get('/get_driver_location/:driverEmail', (req,res)=>{

      //make an API Call to get the Location
      var updatedEmail = "";
      var d_mail = req.params.driverEmail;

      //Removing the . from Email
      updatedEmail = NewEmail(d_mail);

       console.log(updatedEmail);
      //reading location from firebase of particular driver
      //reading data from the database
         db.ref('/drivers/'+updatedEmail+'/location').on("value", function(snapshot) {

           console.log("Value "+snapshot.val());

           if( snapshot.val() === null ){
             res.render('not_found');
           } else {

             snapshot.forEach(function(snapshotVal) {

                      driver_location = {
                       lat : snapshotVal.val().latitude,
                       long : snapshotVal.val().longitude
                     }

                   });

                   //now using location make a API Call to get Location
                   console.log(driver_location.lat);
                   console.log(driver_location.long);
                   axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+driver_location.lat+'&longitude='+driver_location.long+'&localityLanguage=en#')
                  .then(response => {

                      console.log("Country  : "+response.data.localityInfo.administrative[0].name);
                      console.log("State    : "+response.data.localityInfo.administrative[1].name);
                      console.log("District : "+response.data.localityInfo.administrative[2].name);
                      console.log("Place    : "+response.data.localityInfo.administrative[3].name);

                      var driverPlace = {
                        Country : response.data.localityInfo.administrative[0].name,
                        State : response.data.localityInfo.administrative[1].name,
                        District : response.data.localityInfo.administrative[2].name,
                        Place : response.data.localityInfo.administrative[3].name
                      }

                      //as soon as we got the response of api Call
                      res.render('driver_page',{
                        driverPlaceData : driverPlace
                      });


                      })
                      .catch(error => {
                      console.log(error);
                    });



           }



         }, function(error) {
           console.log("Error: " + error.code);
    });


});


//------------------ GET Request for update profile page -------------------//
app.get('/update_profile', (req,res)=>{
   res.render('update_profile');
});

//----------------------- GET Request for LIVE Driver Tracking ----------------------------//

app.get('/my_driver_locations', (req,res)=>{

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
                  contactNumber: driver.contactNumber,
                  email: driver.email,
                  driver_dp:driver.driver_dp
                }

                //adding the driver in the array
                my_driver.push(new_driver);
         });

        res.render('my_driver_locations', {
        userDriverArray : my_driver
      });
  });

});            //get request ends

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
        res.redirect('/user_login1', {errorMsg: "User Not found"});
      } else {

      console.log(company);

      const promise = auth.signInWithEmailAndPassword(email, password);
      promise.catch(e => alert(e.message));

      res.redirect('/user_page');
      console.log("User Found");
    }

  });


  //--------------------------------------------//
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
  var updatedEmail = NewEmail(email);

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
  driver_place = [];

  //sign out the user
  auth.signOut();
  res.redirect('/');
});

//-------------------- POST Request for storing the driver data -------------------------------------//
// requiring multer..........
const multer = require('multer')

// multer middleware.........
const storage = multer.diskStorage({
  destination: function(req, file, call_back){
      call_back(null, './public/driver_dp/')
  },
  filename: function(req, file, call_back) {
      call_back(null, file.fieldname+ "_"+Date.now()+path.extname(file.originalname)  )
  }
})
const upload = multer( { 
  storage: storage,
  limits: {
      fileSize: 1024*1024*2
  }
})

app.post('/my_drivers',  upload.single('driver_dp'), (req, res) => {

     var driverEmail = req.body.email;

     //Removing the . from Email
     var updateDriverEmail = NewEmail(req.body.email);

     var day = new Date();

     var password = "_hacker"+day.getDay()+day.getMonth()+day.getFullYear();
     console.log(driverEmail);
     console.log(password);


     //sending email to the driver
     const nodemailer = require('nodemailer');
     const { getMaxListeners } = require('process');
     const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         user: 'solutionobd@gmail.com',
         pass: 'obdsolution@2020'
       }
      });

      // email options
let mailOptions = {
    from:'solutionobd@gmail.com',
    to: driverEmail,
    subject:'OBD : Login credentials' ,
    text:`Your Credentials : ${password} and email will be your registered email`
  };

    // send email
      transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log(error);
        }
          console.log(response)
        });

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
        email : req.body.email,
        driver_dp: req.file.filename
      });

      console.log(email);
      //storing data in the mongo database
      const newDriver = new Driver({
        firstName: req.body.firstName,
        createdOn: day.getDay() + "/" + day.getMonth() + "/" + day.getFullYear(),
        contactNumber: req.body.phoneNo,
        licenceNo: req.body.licenceNo,
        address: req.body.address,
        email : req.body.email,
        companyEmail : email,
        driver_dp: req.file.filename
      });
        
      newDriver.save();
       console.log(newDriver ," new driver")
      res.redirect('/my_drivers');
    }
     

});

//---------- POST request for updating the user profile --------------------------------//
app.post('/update_profile', (req,res)=>{

   //Updating the mongo database
   var myquery = { companyEmail: email };
   var newvalues = { $set: { companyName : req.body.company_name , companyAddress : req.body.address , contactDetail : req.body.contact_no  } };
   Company.updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("User Profile Updated");
  });

  //providing 3 seconds delay so that DataBase can get updated
  setTimeout(function(){

    res.redirect('user_page');

   }, 3000);


});


//---------  Listener for the our hosted server ----------------------------------------//

app.listen(3000, () => {
  console.log("Server Started on port 3000");
});
