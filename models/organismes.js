/** Model user_vote
 * @module models/organismes
 * @requires mongoose
 */

const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @name organismesSchema
 * @requires mongoose
 * @memberof module:models/organismes
 * @function
 * @param {array} - Propriétés de mon schéma
 */
const organismesSchema = mongoose.Schema({
    _id: {
        type: ObjectId
    },
    nom: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('organismes', organismesSchema)