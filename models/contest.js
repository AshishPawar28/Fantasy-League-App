var mongoose = require("mongoose");


var ContestSchema = new mongoose.Schema({
    name: {
        type: String
        },
    amount:{
        type: Number
    },
    games:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game"
        }
    ],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"       
    }],
    rankTable:[{
        participantId: String,
        points: Number
    }]
    
});

module.exports = mongoose.model("Contest",ContestSchema);