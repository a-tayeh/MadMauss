var middlewareObj = {};
var Product = require("../models/products");
var Review  = require("../models/reviews");


middlewareObj.productOwnership = function (req,res,next){
    // checks if user is logged in and checks if the id of the user that created this product matches
    // with current user
    if(req.isAuthenticated()){
        Product.findById(req.params.id, function(err, foundProduct) {
            if(err){
                res.redirect("back");
            }
            else{
                if(foundProduct.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    
                    req.flash("error", "Only "+ foundProduct.author.username+ " can edit/delete this product!" );
                    return res.redirect("back");
                }
            }
        });
    }
    else{
        
        res.redirect("back")
    }
} 
    // checks if user is logged in and checks if the id of the user that created this review matches
    // with current user
 middlewareObj.reviewOwnership = function (req,res,next){
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview) {
           if(err){
               console.log(err)
               res.redirect("back");
           }
           else{
               if(foundReview.author.id.equals(req.user._id)){
                   next();
               }
               else{
                   req.flash("error", "Only "+ foundReview.username+ " can edit/delete this review!" );
                   res.redirect("/login");
               }
           }
        });
    }
    else{
        req.flash("error", "you need to be logged in");
        res.redirect("/login")
    }
}
    // checks if user is logged in 
middlewareObj.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login!");
    res.redirect("/login");
}




module.exports = middlewareObj;