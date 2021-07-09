var express = require("express");
var Contest = require("../models/contest");
var User = require("../models/user");
var Game = require("../models/game");
var Team = require("../models/team");
const team = require("../models/team");
var router = express.Router();



router.get("/",isLoggedIn,(req,res)=>{
	var curUser = req.user;
	User.findById(curUser._id).populate("contests").exec(function(err,curUser){
		if(err){
			console.log(err);
		}else{
			
			res.render("adminPanel",{currentUser:curUser});
		}
	});
    
});

router.get("/createContest",isLoggedIn, (req,res)=>{
	res.render("createContest");
});

router.post("/createContest",isLoggedIn, (req,res)=>{
	var contest = new Contest({name: req.body.name, amount: req.body.amount});
	Contest.create(contest,function(err, contest){
		if(err){
			console.log(err);
		}else{
			req.user.contests.push(contest);
			req.user.save();
			res.redirect("/adminPanel/createContest/"+contest._id);
		}
	});
});

router.get("/createContest/:contestID",isLoggedIn,(req,res)=>{
	Contest.findById(req.params.contestID).populate({
		path: 'games',
		model: 'Game',
		populate: {
			path: 'teams',
			model: 'Team'
		}
	}).
	exec(function (err, contest) {
		if (err){
			console.log(err);
		}else{
			console.log(contest.games);
			res.render("contestEdit",{contest:contest});
		}
		
	});


	
});

router.post("/createContest/:contestID",isLoggedIn,(req,res)=>{
	Contest.findById(req.params.contestID,function(err,contest){
		if(err){
			console.log(err);
		}else{
			var game = new Game({sport: req.body.game});
			Game.create(game,function(err,game){
				if(err){
					console.log(err);
				}else{
					contest.games.push(game);
					contest.save();
					var teamOne = new Team({name: req.body.team1, status: false});
					var teamTwo = new Team({name: req.body.team2, status: false});
					Team.create(teamOne,function(err,teamOne){
						if(err){
							console.log(err);
						}else{
							Team.create(teamTwo,function(err,teamTwo){
								if(err){
									console.log(err);
								}else{
									game.teams.push(teamOne);
									game.teams.push(teamTwo);
									game.save();

									res.redirect("/adminPanel/createContest/"+contest._id);
								}
						});
						}
						
					});
				}
			});

		}

	});
});



router.get("/fillScore/:teamId/:contestId",(req,res)=> {
	
	team.findById(req.params.teamId,function(err,team){
		if(err){
			console.log(err);
		}else{
			res.render("fillScore",{team: team, contestId: String(req.params.contestId)});
		}
	});
	
	
});


router.post("/fillScore/:teamId/:contestId",(req,res)=> {
	
	Team.findById(req.params.teamId,function(err,team){
		if(err){
			console.log(err);
		}else{
			team.score = Number(req.body.score);
			team.save();
			console.log(team.score);
			res.redirect("/adminPanel/createContest/"+req.params.contestId);

		}
	});
	
	
	
});


router.get("/calculate/:contestId",(req,res)=>{

	Contest.findById(req.params.contestId).populate({
		path: 'games',
		model: 'Game',
		populate: {
			path: 'teams',
			model: 'Team'

		}
	}).populate({
		path: 'participants',
		model: 'User'
	}).exec(function(err,contest){
		if(err){
			console.log(err);
		}else{
			var rankTable = [];
			for(var i=0; i<contest.games.length; i++){
				calculatePoints(contest.games[i].teams[0],contest.games[i].teams[1]);
				
				
				contest.games[i].teams[0].save();
				contest.games[i].teams[1].save();
			}

			var totalPoints = 3;
			contest.participants.forEach(function(participant){
				var pointsScored = {contestId: String(contest._id), points: 0};

				participant.teams.forEach(function(Contest){
					
					if(String(Contest.contestId)==String(contest._id)){
						//We are done till adding score to the user now we need to create a rank table
						Contest.teams.forEach(function(teamId){
							for(var i=0; i<contest.games.length; i++){
								for(var j=0; j<contest.games[i].teams.length; j++){
									if(String(contest.games[i].teams[j]._id)==String(teamId.teamId)){
										pointsScored.points = pointsScored.points + contest.games[i].teams[j].points;
										console.log(pointsScored.points);
									}
								}
							}
						});

						
						

					}
				});

				participant.pointsScored.push(pointsScored);
				participant.save();
				rankTable.push({
					participantId: String(participant._id),
					points: pointsScored.points
				});

				console.log(participant);


			});


			
function swap(rankTable, leftIndex, rightIndex){
    var temp = rankTable[leftIndex];
    rankTable[leftIndex] = rankTable[rightIndex];
    rankTable[rightIndex] = temp;
}
function partition(rankTable, left, right) {
    var pivot   = rankTable[Math.floor((right + left) / 2)], //middle element
        i       = left, //left pointer
        j       = right; //right pointer
    while (i <= j) {
        while (rankTable[i].points < pivot.points) {
            i++;
        }
        while (rankTable[j].points > pivot.points) {
            j--;
        }
        if (i <= j) {
            swap(rankTable, i, j); //sawpping two elements
            i++;
            j--;
        }
    }
    return i;
}

function quickSort(rankTable, left, right) {
    var index;
    if (rankTable.length > 1) {
        index = partition(rankTable, left, right); //index returned from partition
        if (left < index - 1) { //more elements on the left side of the pivot
            quickSort(rankTable, left, index - 1);
        }
        if (index < right) { //more elements on the right side of the pivot
            quickSort(rankTable, index, right);
        }
    }
    return rankTable;
}
// first call to quick sort
var sortedArray = quickSort(rankTable, 0, rankTable.length - 1);
contest.rankTable = sortedArray; //prints [2,3,5,6,7,9]
contest.save();











			res.send(contest.rankTable);
		}
	});

});





function calculatePoints(team1, team2){
	var points;
	if(team1.score>team2.score){
		points = (( team1.score - team2.score )/team1.score)*10;
		team1.points = points;
		team2.points = 0;
	}else if(team1.score<team2.score){
		points = (( team2.score - team1.score )/team2.score)*10;
		team1.points = 0;
		team2.points = points;
	}else{
		team1.points = 5;
		team2.points = 5;
	}
	return;
}




function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/loginOpt");
}

module.exports = router;