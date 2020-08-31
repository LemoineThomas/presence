/** Model user_vote
 * @module models/formations
 * @requires mongoose
 */

const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @name formationsSchema
 * @requires mongoose
 * @memberof module:models/formations
 * @function
 * @param {array} - Propriétés de mon schéma
 */
const formationsSchema = mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    sheet: {
        type: String,
        required: true
    },
    contenu: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model('formations', formationsSchema)