var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var ItemSchema = new mongoose.Schema({
	ngoname:String,
	itemname:String,
	quantity:String,
	location:String,
	verified:Boolean//finished product
	// amount:String,
	// details:String,
	// money:String
});
module.exports = mongoose.model("Item",ItemSchema);