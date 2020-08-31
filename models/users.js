/** Model user_vote
 * @module models/users
 * @requires mongoose
 */

const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @name usersSchema
 * @requires mongoose
 * @memberof module:models/users
 * @function
 * @param {array} - Propriétés de mon schéma
 */
const userSchema = mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('users', userSchema)