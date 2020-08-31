/** Model user_vote
 * @module models/formations
 * @requires mongoose
 */

const mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @name signerSchema
 * @requires mongoose
 * @memberof module:models/signer
 * @function
 * @param {array} - Propriétés de mon schéma
 */
const signerSchema = mongoose.Schema({
    id_users: {
        type: ObjectId,
        required: true,
        ref: 'users'
    },
    id_formations: {
        type: ObjectId,
        required: true,
        ref: 'formations'
    },
    jour: {
        type: Array
    }
})

module.exports = mongoose.model('signers', signerSchema)