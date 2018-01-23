var express         = require("express");

var app             = express(),
    User            = require("./models/user"),
    flash           = require("connect-flash"),
    moment          = require("moment"),    
    dotenv          = require("dotenv").config(),    
    express         = require("express"),
    passport        = require("passport"),
    mongoose        = require("mongoose"),    
    bodyParser      = require("body-parser"),    
    cookieParser    = require("cookie-parser"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    //dotenv package is used to hide our sensitive credentials
    dotenv          = require('dotenv').config();

    
//requiring routes
var reviewRoutes    = require("./routes/reviews"),
    productRoutes   = require("./routes/products"),
    authRoutes      = require("./routes/auth");



// Database connection
mongoose.connect(process.env.MLAB_DB, { useMongoClient: true });
// tells node that all our of views files will end with ejs
app.set("view engine", "ejs");
app.use(cookieParser('secret'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "As I win again you cant's!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
//starts up our passportJS
app.use(passport.initialize());
app.use(passport.session());
// Uses the local strategy and puts in User model
passport.use(new LocalStrategy(User.authenticate()));
// reading encoded data from session, by unencoding it then re-encoding it using deserialize method
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// This will have currentUser, moment, success,gmap(apikey) and error be global variables accessible to all of our views
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.moment = moment;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.gmap = process.env.GGL_API;
   res.locals.rec_key = process.env.RECAPTCHA_KEY;
   next();
});

// this will have our app.js use the routes we have defined in our routes directory!
app.use(authRoutes);
app.use(productRoutes);
app.use(reviewRoutes);

// starts up the server
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Madmauss Server Has Started!");
});
