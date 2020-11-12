var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose =require("passport-local-mongoose");
var User = require("./models/user");
var Job = require("./models/job");
var Item = require("./models/item");

const axios = require('axios');

var app = express();

mongoose.connect('mongodb://localhost:27017/tdus', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));



app.use(express.static(__dirname + '/public'));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({encoded:true}));


app.use(require("express-session")({
	
	secret:"divideup is the best",
	resave:false,
	saveUninitialized:false
	
}));

app.use(passport.initialize());
app.use(passport.session());
		
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

//Mail
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thedivviedupsociety@gmail.com',
    pass: ''
  }
});

app.get("/donate/:id",function(req,res){
	//
	var name = req.user.username;
	var ph = req.user.contact;
	var str = ' is willing to donate the item you requested for. Please reach the donator at  '
	var mailOptions = {
	  from: 'thedivviedupsociety@gmail.com',
	  to: '',
	  subject: 'Confirmation required by a donator!',
	  text: name.concat(str,ph)
	};
	
	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
	  }
	});
	//
	res.redirect("/");
});
//Mail end

app.get("/",function(req,res){
	res.render("index");
});

app.get("/index",function(req,res){
	if(req.isAuthenticated()){
		// console.log(req.user["role"]=="creator");	
	}
	res.render("index");
});




app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	User.register(new User({username:req.body.username,contact:req.body.contact,role:req.body.role}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.render("login");
		})
	})
})

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect:"/index",
	failureRedirect:"/login"
}),function(req,res){
	// console.log(req.user);
})

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

app.get("/post",isNgohead,function(req,res){
	res.render("post");
});

app.post("/post",function(req,res){
	Job.create(new Job({ngoname:req.body.ngoname,location:req.body.location,item:req.body.item,amount:req.body.amount,details:req.body.details,money:req.body.money,verified:false}),function(err,job){
		if(err){
			console.log(err);
			return res.render("register");
		}
		res.redirect("/jobpost");
	})
})

app.get("/verify/job/:id",function(req,res){
	Job.findById(req.params.id,function(err,job){
		if(err){
			console.log(err);
		}else{
			job.verified = true;
			job.save();
			res.redirect("/jobpost");
		}
	})
});

app.get("/verify/item/:id",function(req,res){
	Item.findById(req.params.id,function(err,item){
		if(err){
			console.log(err);
		}else{
			item.verified = true;
			item.save();
			res.redirect("/donate");
		}
	})
});

app.get("/jobpost",function(req,res){
	// console.log(req.user);
	//retrieve data from the database
	Job.find({},function(err,alljobs){
		if(err){
			console.log(err);
		}
		else{
			res.render("jobpost",{jobs:alljobs,currentUser:req.user})
		}
	})
});

app.get("/request",isNgohead,function(req,res){
	res.render("request");
});

app.post("/request",function(req,res){
	Item.create(new Item({ngoname:req.body.ngoname,itemname:req.body.itemname,location:req.body.location,quantity:req.body.quantity,
	verified:false}),function(err,item){
		if(err){
			console.log(err);
			return res.render("register");
		}
		res.redirect("/donate");
	})
})

app.get("/donate",function(req,res){
	// console.log(req.user);
	//retrieve data from the database
	Item.find({},function(err,allitems){
		if(err){
			console.log(err);
		}
		else{
			res.render("donate",{items:allitems,currentUser:req.user})
		}
	})
});

app.get("/apply/:id",isLoggedIn,function(req,res){
	//find the job by using findbyid
	var name = req.user.username;
	var ph = req.user.contact;
	var str = ' is willing to create the item you requested for. Please reach the creator at  '
	var mailOptions = {
	  from: 'thedivviedupsociety@gmail.com',
	  to: 'siddharthmohanty812@gmail.com',
	  subject: 'Confirmation required by a creator!',
	  text: name.concat(str,ph)
	};
	
	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
	  }
	});
	
	
	Job.findById(req.params.id,function(err,job){
		if(err){
			console.log(err);
		}else{
			var currjob = {
				ngoname:job.ngoname,
				item:job.item
			}
			req.user.jobs.push(currjob);
			req.user.save();
			
			res.redirect('/dashboard/'+ req.user._id);
		}
	})	
	//add it to the current user schema
})
app.get("/dashboard/:id",isLoggedIn,function(req,res){
	res.render("dashboard",{currentUser:req.user});
})
app.get("/showpost/:id",isLoggedIn,function(req,res){

	Job.findById(req.params.id,function(err, foundJob){
		
		if(err){
			console.log(err);
		}
		else{
		  res.render("showpost",{job:foundJob});
		}
	});
	
});

function isLoggedIn(req,res,next){
	
	if(req.isAuthenticated()){
		// console.log(currentUser);
		return next();
	}
	res.redirect("/register");
}



//role middlewares---------------
function isCreator(req,res,next){
	if(req.isAuthenticated()){
		if(req.user.role  == "creator"){
			return next();
		}
	}
	res.redirect("/register");
}

function isDonator(req,res,next){
	if(req.isAuthenticated()){
		if(req.user.role  == "donator"){
			return next();
		}
		
	}
	res.redirect("/register");
}
function isNgohead(req,res,next){
	if(req.isAuthenticated()){
		if(req.user.role == "ngohead"){
			return next();
		}
	}
	res.redirect("/register");
}

//-----------------------
	
app.listen(process.env.PORT || 3000,process.env.IP,function(){
	console.log("Server has started..");
});