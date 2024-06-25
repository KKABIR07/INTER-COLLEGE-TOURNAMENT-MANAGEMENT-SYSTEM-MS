const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fwinnerSchema = new Schema({
    leagueName: { type: String, required: true },
    finalNames: { type: [String], default: [] }
});

const fwinner = mongoose.model('fwinner', fwinnerSchema);

module.exports = fwinner;
