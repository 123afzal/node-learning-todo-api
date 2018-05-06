/**
 * Created by Syed Afzal
 */
const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/* the purpose of this code is to understand how bcrypt algorithm works */
let pass = "abc123++";

// bcrypt.genSalt(10, (err, salt)=>{
//     bcrypt.hash(pass, salt, (err,hashPass)=>{
//         console.log(hashPass);
//     })
// });

let hashedPass = '$2a$10$VEH./2XR.VCcX3DEoLM4vuW7LxmGKbpxGtmVu/VGPTcvOErfK9Kku';

bcrypt.compare(pass, hashedPass, (err, res)=>{
    console.log(res);
});
// /* this all code are based on jwt and hashing */
// let message = SHA256('I am user 23');
// console.log(message.toString());
//
//
// //this piece of code is only for checking how someone from front-end change the token and do some illegal task to some other person data
// let data = {
//     id: 4
// };
//
// //understanding working of jwt
// let jwtToken = jwt.sign(data, 'mySecret');
// console.log("jwtToken : ",jwtToken);
// let decoded = jwt.verify(jwtToken, 'mySecret');
// console.log('decoded : ', decoded);
//
// //hashing continue
// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'secret key').toString()
// };
//
// /*now suppose we send to front-end a token and he can manipulate with our token by changing his id from 4 to 5 which is something we
// need to prevent */
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
//
//
// let resultHash = SHA256(JSON.stringify(data) + 'secret key').toString();
// console.log(resultHash);
// console.log(token.hash);
//
// if(resultHash === token.hash) console.log("Data is not changed");
// else console.log("Data is Changed don't trust it on");
//
//so by adding secret key we are able to prevent data chaanged from front end