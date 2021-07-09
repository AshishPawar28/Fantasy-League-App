var express = require("express");
const https = require("https");
const qs = require("querystring");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var loginOptRoute = require("./routes/loginOpt");
var adminPanelRoute = require("./routes/adminPanel");
var userPanelRoute = require("./routes/userPanel");
var passport = require("passport");
var LocalStrategy = require("passport-local");



//Models

var User = require("./models/user");


//Authentication of which I have no idea of how is it working
app.use(require("express-session")({
	secret: "this is authetication for test app",
	resave: false,
	saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());



app.use(function( req, res, next){
	res.locals.currentUser = req.user;
	next();
});

//Connecting to DB
mongoose.connect("mongodb://localhost:27017/FLA",{useNewUrlParser:true,useUnifiedTopology: true})
.then(()=>{ console.log("mongo connection open!!")})
.catch(err => {
	console.log("ohh no mongo connection error");
	console.log(err);
});



//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");

//Middlewares For Routes
app.use("/loginOpt", loginOptRoute);
app.use("/adminPanel", adminPanelRoute);
app.use("/userPanel", userPanelRoute);

//Route for home
app.get("/",isLoggedIn, (req,res) => {
	var currentUser =req.user;
	if(currentUser.isAdmin){
		res.redirect("/adminPanel");
	}else if(!currentUser.isAdmin){
		res.redirect("/userPanel");
	}else{
		res.send("Here we go again");
	}
    
});







app.get("/fakeUser", async (req,res) =>{
	const user = new User({username: "Bhola", password: "gola"});
	const newUser = await User.register(user, user.password);
	res.send(newUser); 
});

app.post("/check", (req,res) =>{
	res.send(req.body);
});




function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/loginOpt");
}



app.listen(3002,()=> {
console.log("the server has started!!");
});




