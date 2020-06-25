//for securing api key and credentials
require('dotenv').config()

//Importing firebase modules
const firebase = require('firebase/app');

//Adding required features
require('firebase/auth');
require('firebase/database');

// TODO: Replace the following with your app's Firebase project configuration
// Your web app's Firebase configuration
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


 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);

//making auth reference
  const auth = firebase.auth();

// getting database reference
   var db = firebase.database();


//requiring npm modules
const express = require('express');
const ejs = require('ejs');
const path = require('path')
const bodyParser = require('body-parser');


// Inclusion of features
const app = express();
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({extended: true}));


// handling all the get request

// router for home page.....
app.get("/",(req,res) => {
  res.render("home");
});

// router for login page....
app.get("/login",(req,res) => {
  res.render("login");
});


// router for user login....
app.get("/user_login1",(req,res) => {
  res.render("user_login1");
});


// router for admin login....
app.get("/admin_login1",(req,res) =>{
   res.render("admin_login1");
});

//route for admin page
app.get('/admin_page',(req,res)=>{
  res.render('admin_page');
});

//route for user page after Login
app.get('/user_page',(req,res)=>{
  res.render('user_page');
});

// route for signup page...
app.get("/signup1",(req,res)=>{
  res.render("signup1");
});


//handling all the post request

app.post("/login",(req,res)=>{

   var email = req.body.username;
   var password = req.body.password;

   const promise = auth.signInWithEmailAndPassword(email, password);
   promise.catch(e => alert(e.message));

   res.redirect('/user_page');

   //this function gets triggered automatically
   //whenever there is a change
   firebase.auth().onAuthStateChanged(function(user) {
   if (user) {
     // User is signed in.
     console.log(user.uid);
     userID = user.uid;
   } else {
     // No user is signed in.
     console.log("no");
   }
   });

});



app.post('/signup',(req,res)=>{

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

      //storing in the database
      db.ref(userID).set({
        email : req.body.username,
        contactDetail : req.body.contactDetails,
        companyName : req.body.companyName
      });

   } else {
     // No user is signed in.
     console.log("no");
   }
   });


  res.redirect('/user_page');

});

app.post('/admin_login1',(req,res)=>{

  var email = req.body.username;
  var password = req.body.password;

  console.log(email);

  const promise = auth.signInWithEmailAndPassword(email, password);
  promise.catch(e => alert(e.message));

  res.redirect('/admin_page');

});

app.post('/signout',(req,res)=>{

  //sign out the user
  auth.signOut();
  res.redirect('/');
});

app.get('/my_drivers', (req, res) => {
  res.render('my_drivers')
})
app.get('/contact_us', (req, res) => {
  res.render('contact_us')
})

//listenenr function

app.listen(3000,() =>{
  console.log("Server Started on port 3000");
});
