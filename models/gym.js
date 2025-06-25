const mongoose=require('mongoose');

const gymSchema=new mongoose.Schema({
    fullName: String,
    fullEmail: String,
    number: String,
    DOB: String,
    code: String,
    newcode:String
});

module.exports=mongoose.model("Gym",gymSchema)