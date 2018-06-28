var express = require("express"),
    router = express.Router(),
    Product = require("../models/products"),
    middleware = require("../middleware"),
    geocoder = require("geocoder"),
    request = require("request");

// *******************************************************
//           image upload using cloudinary and multer
// *******************************************************
var multer = require('multer');
var storage = multer.diskStorage({
      filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
      }
    });
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are permitted!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})
// *******************************************************
//                  cloudinary configs
// *******************************************************
var cloudinary = require('cloudinary');
    cloudinary.config({ 
      cloud_name: 'madmauss', 
      api_key: process.env.DB_APIKEY, 
      api_secret: process.env.API_SECRET 
    });
   
    
    router.get("/", function(req,res){
        res.redirect("/products")
    });
    //INDEX
    router.get("/products", function(req,res){
        Product.find({}, function(err,product){
            if(err){
                console.log(err);
            }
            else{
                res.render("index", {products: product});
            }
        });
        
    });
    //NEW
    router.get("/products/new", middleware.isLoggedIn, function(req,res){
        res.render("products/new")
    });
    //CREATE
    router.post("/products", middleware.isLoggedIn, upload.single("image"), function(req, res){
      // get data from form and add to products in mongoDB



      var name = req.body.product.name;;
      var description = req.body.product.description;
      var author = {
          id: req.user._id,
          username: req.user.username
      }
      var cost = req.body.product.cost;
      
    geocoder.geocode(req.body.product.location, function (err, data) {
        cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the product object 
        var image = result.secure_url;
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newProduct = {name: name, image: image, description:description,author:author, cost:cost, location: location, lat: lat, lng: lng};
        // Create a new product and save to DB
        Product.create(newProduct, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to products page
                console.log(newlyCreated);
                res.redirect("/products");
                }
            });


        });

        
      });
    });
    //SHOW
    router.get("/products/:id", function(req, res) {
        Product.findById(req.params.id).populate("reviews").exec(function(err,product){
            if(err){
                console.log(err);
            }
            else{
                res.render("products/show", {product:product});
            }
        });
    });
    
// *******************************************************
//                  Product Edit route
// *******************************************************
router.put("/products/:id", middleware.isLoggedIn, function(req, res){
  geocoder.geocode(req.body.product.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var updatedProduct = {name: req.body.product.name, image: req.body.product.image, description: req.body.product.description, cost: req.body.product.cost, location: location, lat: lat, lng: lng};
    Product.findByIdAndUpdate(req.params.id, {$set: updatedProduct}, function(err, product){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/products/" + product._id);
        }
    });
  });
})
// *******************************************************
//                  Product delete route
// *******************************************************    
    router.delete("/products/:id",middleware.productOwnership , function(req,res){
        Product.findByIdAndRemove(req.params.id, function(err, product){
            if(err){
                req.flash("error", err.message);
                res.redirect("/products/"+req.params.id);
            }
            else{
                res.redirect("/products");
            }
        });
    });
    
module.exports = router;