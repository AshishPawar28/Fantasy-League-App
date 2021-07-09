var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Contest = require("../models/contest");


router.get("/",(req,res)=>{
    res.render("userPanel");
});

router.post("/",(req,res)=>{

    User.findOne({username:req.body.admin}).populate("contests").exec(function(err,admin){
        if(err){
            console.log(err);
        }else{
           res.render("showContests",{admin:admin});
           
        }
    });
    
});

router.get("/:contestID",(req,res)=>{
    
    Contest.findById(req.params.contestID).populate({
        path: 'games',
        model: 'Game',
        populate: {
            path:'teams',
            model: 'Team'
        }

    }).exec(function(err, contest){
        if(err){
            console.log(err);
        }else{
            //req.user.contests.push(contest);
            //req.user.save();
            //contest.users.push(req.user);
            //contest.save();
            var parStatus = false;
            req.user.contests.forEach(function(Usercontest){
                if(String(contest._id)==String(Usercontest)){
                    
                    parStatus = true;
                   
                }
            });

            var gameIdArray;
            var printAdd = true;

            req.user.teams.forEach(function(ContestChosen){
                if(String(ContestChosen.contestId)==String(contest._id)){
                    gameIdArray = ContestChosen.games;
                }
            });

           console.log(gameIdArray);
            
            res.render("contestDes",{contest: contest,parStatus: parStatus,user: req.user,gameIdArray:gameIdArray, printAdd: printAdd });
        }
    });

});

router.get("/participate/:contestID",(req,res) =>{
    
        Contest.findById(req.params.contestID, (err,contest) =>{
            if(err){
                console.log(err);
            }else{
                req.user.contests.push(contest);
                req.user.teams.push({contestId: String(req.params.contestID), teams: [], games: []});
                req.user.save();
                contest.participants.push(req.user);
                contest.save();
                res.redirect("/userPanel/"+String(req.params.contestID));
            }
        });
   
});

router.get("/addTeam/:teamId/:gameId/:contestId",(req,res) =>{
    
    for(var i=0; i<req.user.teams.length; i++){
        if(req.user.teams[i].contestId==req.params.contestId){
            req.user.teams[i].games.push({gameId: String(req.params.gameId)});
            req.user.teams[i].teams.push({teamId: String(req.params.teamId)});
            req.user.save();
            break;
        }
    }
    
    var contestID = String(req.params.contestId);


    res.redirect("/userPanel/"+contestID);


});




module.exports = router;