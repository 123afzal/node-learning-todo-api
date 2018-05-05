/**
 * Created by Syed Afzal
 */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a email'
        }
    },
    password:{
        type: String,
        minlength:8,
        required: true,
    },
    tokens:[{
        access:{
            type: String,
            required: true,
        },
        token:{
            type: String,
            required: true
        }
    }]
});


UserSchema.methods.generatAuthToken = function () {
    var user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'thisismysecret');

    user.tokens.push({access, token});

    return user.save().then(()=>{
        return  token
    })
};

var Users = mongoose.model('Users', UserSchema);

module.exports = {Users};