const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fixtures: {
        type: Array,
        required: true
    },
    players: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        }
    ]
});

const League = mongoose.model('League', leagueSchema);

module.exports = League;
