var mongoose = require("mongoose");

var GameSchema = new mongoose.Schema({
    sport: {
        type: String
    },
    teams:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }]

});

module.exports = mongoose.model("Game",GameSchema);