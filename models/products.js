var mongoose = require("mongoose");

var productsSchema = new mongoose.Schema({
    name:String,
    location:String,
    lat:Number,
    lng:Number,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    createdAt : {type: Date, default: Date.now},
    image:String,
    cost:String,
    description: String,
    reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Review"
            }   
        ]
    
    
});

module.exports = mongoose.model("Product",productsSchema);