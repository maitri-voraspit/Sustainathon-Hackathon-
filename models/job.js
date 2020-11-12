var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var JobSchema = new mongoose.Schema({
	// username:String,
	// password:String,
	// contact:String,
	// role:String,
	ngoname:String,
	location:String,
	item:String,//finished product
	amount:String,
	details:String,
	money:String,
	verified:Boolean
});

module.exports = mongoose.model("Job",JobSchema);