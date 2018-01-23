var express = require("express"),
    router = express.Router(),
    Product = require("../models/products"),
    Review = require("../models/reviews"),
    middleware = require("../middleware");
    


router.post("/products/:id/reviews", middleware.isLoggedIn,function(req, res){
   //find the target product using ID then 
   Product.findById(req.params.id, function(err, product){
       if(err || !product){
           req.flash("error", err.message);
           res.redirect("/products");
       } else {
        Review.create(req.body.review, function(err, foundReview){
           if(err){
               req.flash("error", err.message);
           } else {
               foundReview.author.id = req.user._id;
               foundReview.author.username = req.user.username;
               foundReview.save();
               product.reviews.push(foundReview);
               product.save();
               req.flash("success", "review added successfully!")
               res.redirect('/products/' + product._id);
           }
        });
       }
   });
   //create new review, push that review to the review array of that specific product, 
   //then redirect back to that product show page

});

// *******************************************************
//                  review put route
// *******************************************************
router.put("/products/:id/reviews/:review_id", function(req, res){
   Review.findByIdAndUpdate(req.params.review_id, req.body.review, function(err, review){
       if(err){
           req.flash("err", err.message)
       } else {
           res.redirect("/products/" + req.params.id);
       }
   }); 
});

// *******************************************************
//                  review delete route
// *******************************************************  
router.delete("/products/:id/reviews/:review_id", middleware.reviewOwnership,function(req,res){
    Review.findByIdAndRemove(req.params.review_id, function(err, deleteReview){
        if(err || !deleteReview){
            req.flash("error", err.message);
            res.redirect("back");
        }
        else{
            req.flash("error", "review has been deleted!")
            res.redirect("/products/"+req.params.id);
        }
    });
});




module.exports = router;