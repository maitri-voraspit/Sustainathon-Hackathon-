var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username:String,
	password:String,
	contact:String,
	role:String,
	email:String,
	jobs:[
		{
			ngoname:String,
			item:String
		}
	]
});

UserSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User",UserSchema);