const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/userCovers'

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    coverImageName: {
        type: String,
        required: true
    },
})

userSchema.virtual('coverImagePath').get(function() {
    console.log('Virtual getter called');
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }

    return null;
})

module.exports = mongoose.model('User', userSchema)
module.exports.coverImageBasePath = coverImageBasePath