const mongoose = require('mongoose')
const path = require('path')

const coverImageBasePath = 'uploads/bookCovers'


const contactShema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    coverImageName: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    createdUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

contactShema.virtual('coverImagePath').get(function() {
    if (this.coverImageName != null) {
      return path.join('/', coverImageBasePath, this.coverImageName);
    }
});

const Contact = mongoose.model('Contact', contactShema);

module.exports = Contact;
module.exports.coverImageBasePath = coverImageBasePath;