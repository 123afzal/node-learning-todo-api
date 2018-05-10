/**
 * Created by Syed Afzal
 */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'thisismysecret').toString();

    user.tokens.push({access, token});

    return user.save().then(()=>{
        return token;
    })
};

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull:{
            tokens:{token}
        }
    })
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decode;

    try{
        decode = jwt.verify(token, 'thisismysecret');
    } catch (e){
        return Promise.reject();
    }

    return User.findOne({
        '_id': decode._id,
        'tokens.token': token,
        'tokens.access': decode.access
    }).select('email')
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject()
        }

        return new Promise((resolve, reject)=>{
            bcrypt.compare(password, user.password, (err,res)=>{
                if(res){
                    console.log(res);
                    resolve(user)
                } else{
                    console.log(res);
                    reject()
                }
            })
        })
    })
};

UserSchema.pre('save', function (next) {
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err,salt)=>{
            bcrypt.hash(user.password, salt, (err,hash)=>{
                user.password = hash;
                next();
            })
        })
    } else{
        next();
    }
});

var Users = mongoose.model('Users', UserSchema);

module.exports = {Users};