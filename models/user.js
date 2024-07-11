const mongoose = require('mongoose')

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
    }
})

userSchema.statics.findByCredentials = async function (username, password) {
    const user = await this.findOne({ username }).exec();

    if (!user) {
        return null;
    }

    const isMatch = user.password === password;

    if (!isMatch) {
        return null;
    }

    return user;
};

module.exports = mongoose.model('User', userSchema)