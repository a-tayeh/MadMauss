var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    passport = require("passport"),
    request = require("request"),
    middleware = require("../middleware"),
    Product = require("../models/products");


// *******************************************************
//                  WORK-IN-PROGRESS
// *******************************************************
// router.get("/userProfile",middleware.isLoggedIn, function(req,res){
    
//     Product.find().where('author.id').equals(req.user._id).exec(function(err,product){
//         if(err){
//             req.flash("error", "Something went wrong!");
//             return res.redirect("back");
//         }
//         res.render("userProfile", {product:product});
        
//     })
// });

//PASSPORT ROUTES
router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
    
    const captcha = req.body["g-recaptcha-response"];
    if (!captcha) {
      console.log(req.body);
      req.flash("error", "Please check the captcha so I know you're not a robot!");
      return res.redirect("/register");
    }
    // secret key
    var secretKey = process.env.CAPTCHA;
    // Verify URL
    var verifyURL = "https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}";
    // Make request to Verify URL
    request.get(verifyURL, (err, response, body) => {
      // if not successful
      if(err){
          req.flash("error", err.message)
      }
      if (body.success !== undefined && !body.success) {
        req.flash("error", "Captcha Failed");
        return res.redirect("/register");
      } 
    var newUser = new User({firstName: req.body.firstName,lastName: req.body.lastName, email:req.body.email, username: req.body.username});
    
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register")
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success", "welcome to MadMauss, "+user.username);
            res.redirect("/products");
        });
    });
});
});
//LOGIN
router.get("/login", function(req, res) {
    res.render("login");
});
    // using the local strategy that follows HTML Form Protocol
router.post("/login", passport.authenticate("local", {
    successRedirect:"/products",
    failureRedirect:"/login",
    failureFlash: true,
    successFlash: "Welcome back!"
}),function(req,res){
});

//LOGOUT
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You've been logged out!");
    res.redirect("/products");
})


// *******************************************************
//                  WORK-IN-PROGRESS
// *******************************************************
// router.get("/forgot", middleware.isLoggedIn, function(req, res) {
//   res.render("forgot-password"); 
// });


module.exports = router;