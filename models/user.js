var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {
        type: Boolean 
    },
   teams: [{
        contestId: String,
        games: [{
            gameId : String
        }],
        teams: [{
                    teamId: String
                }] 
            }],
    pointsScored: [{
                contestId : String,
                points : Number
            }],
    contests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest"
            }],
    money: {
        type: Number
    }
    
});


UserSchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("User",UserSchema);



