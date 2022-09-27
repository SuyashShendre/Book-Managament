const mongoose = require('mongoose');

const userModel = new mongoose.Schema({

    title: {
        type: String,
        Required: true,
        enum: ["Mr", "Mrs", "Miss"]
    },
    name: {
        type: String,
        Required: true
    },
    phone: {
        type: String,
        Required: true,
        unique: true
    },
    email: {
        type: String,
        Required: true,
        unique: true
    },
    password: {
        type: String,
        Required: true
    },
    address: {
        street: String,
        city: String,
        pincode: String
    }
}, { timestamps: true });

module.exports = mongoose.model('user', userModel);