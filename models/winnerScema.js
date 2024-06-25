const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const winnerSchema = new Schema({
    leagueName: { type: String, required: true },
    winners: [{ name: { type: String, required: true } }] 
});

const Winner = mongoose.model('Winner', winnerSchema);

module.exports = Winner;