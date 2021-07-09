var mongoose = require("mongoose");

var TeamSchema = new mongoose.Schema({
    name: {
        type: String
    },
    status: {
        type: Boolean
    },
    score: {
        type: Number
    },
    points: {
        type: Number
    }
});

module.exports = mongoose.model("Team",TeamSchema);