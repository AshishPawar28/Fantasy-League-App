var express = require("express");
const passport = require("passport");
var router = express.Router();

var User = require("../models/user");
var bodyParser = require("body-parser");

router.use(bodyParser.json());

router.get("/", (req,res) =>{
    res.render("loginOpt");
});





router.get("/user", (req,res) =>{
    res.render("userLogin");
});

router.post("/user",passport.authenticate("local",
{
    
    successRedirect: "/",
    failureRedirect: "/loginOpt"
}),function(req,res){
    console.log(req.body);
});



router.get("/user/register", (req,res)=> {
    res.render("userRegister");
});



router.post("/user/register", (req,res)=> {
    const user = new User({username: req.body.username, password: req.body.password, isAdmin: req.body.isAdmin});
    console.log(user);
    User.register(user, req.body.password, (err,user)=>{
        if(err){
            console.log(err);
            return res.render("userRegister");

        }
        passport.authenticate("local")(req,res, ()=> {
            res.redirect("/loginOpt/user");
        });
    } ); 
   
        
    });




module.exports = router;