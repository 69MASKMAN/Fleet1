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
  res.render("user_login1");
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
  res.render('user_page');
});


//-------- Route for Signup page ------------------------------//
app.get("/signup1", (req, res) => {
  res.render("signup1");
});


//-------- Route for MY_Drivers after User_page
app.get('/my_drivers', (req, res) => {

    res.render('my_drivers', {
      driverArray : my_driver
    });

});

//------- Route for contact_us --------------------------------//
app.get('/contact_us', (req, res) => {
  res.render('contact_us');
});

//--------- Handling all the post request ---------------------------------------------------//

//---------    POST Request For Login method ------------------------------------------------//

app.post("/login", (req, res) => {

  var email = req.body.username;
  var password = req.body.password;

  const promise = auth.signInWithEmailAndPassword(email, password);
  promise.catch(e => alert(e.message));


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.uid);
      var userID = user.uid;


      //reading data from the database
      db.ref(userID + '/driver').on("value", function(snapshot) {

        //making it empty for every user
         my_driver = [];

        snapshot.forEach(function(snapshotVal) {

          //creating a obj of a driver
          var new_driver = {
            key: snapshotVal.key,
            firstName: snapshotVal.val().firstName,
            createdOn: snapshotVal.val().createdOn,
            contactNumber: snapshotVal.val().contactNumber,
            licenceNo: snapshotVal.val().licenceNo,
            email: snapshotVal.val().email,
            address : snapshotVal.val().address
          }

          //adding the driver in the array
          my_driver.push(new_driver);
        });

        for (var i = 0; i < my_driver.length; i++) {
          console.log(my_driver[i].firstName);
        }


      }, function(error) {
        console.log("Error: " + error.code);
      });

    } else {
      console.log("No");

    }
  });




  res.redirect('/user_page');

});


//---------    POST Request For Signup method -------------------------------------------//

app.post('/signup', (req, res) => {

  var email = req.body.username;
  var password = req.body.password;

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
      console.log(errorMessage);
    }
    console.log(error);
  });



  //this function gets triggered automatically
  //whenever there is a change
  //For getting user UID
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log(user.uid);
      var userID = user.uid;

      //storing company in the database
      db.ref(userID).set({
        email: req.body.username,
        contactDetail: req.body.contactDetails,
        companyName: req.body.companyName
      });


    } else {
      // No user is signed in.
      console.log("no");
    }
  });

  res.redirect('/user_page');

});


//---------    POST Request For Admin Route ---------------------------------------------//

app.post('/admin_login1', (req, res) => {

  var email = req.body.username;
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

//------- POST Request for storing the driver data -------------------------------------//

var driver_id = 1;
app.post('/my_drivers', (req, res) => {

  //this function gets triggered automatically
  //whenever there is a change
  //For getting user UID
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log(user.uid);
      userID = user.uid;

      //Adding the driver in the company list
      var day = new Date();

      db.ref(userID + '/driver').push({
        firstName: req.body.firstName,
        createdOn: day.getDay() + "/" + day.getMonth() + "/" + day.getFullYear(),
        contactNumber: req.body.phoneNo,
        licenceNo: req.body.licenceNo,
        address: req.body.address,
        email: req.body.email
      });


    } else {
      // No user is signed in.
      console.log("no");
    }
  });

  res.redirect('/my_drivers');
});


//---------  Listener for the our hosted server ----------------------------------------//

app.listen(3000, () => {
  console.log("Server Started on port 3000");
});
