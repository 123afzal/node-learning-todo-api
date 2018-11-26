/**
 * Created by Syed Afzal
 */
// configuartion of environment variables

var env = process.env.NODE_ENV || 'development';

console.log("env ___ :", env);

if(env == 'development'){
    process.env.PORT = 8000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if(env == 'test'){
    process.env.PORT = 8000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

// 3rd party dependecies
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const cors = require('cors');
const AWS = require('aws-sdk');

// project models
var {mongoose} = require('../server/db');
var {Todo} = require('./models/todos/todo.model');
var {Users} = require('./models/users/user.model');
var {authenticate} = require('./middleware/authenticate');

var port = process.env.PORT;
var app = express();

app.use(bodyParser.json());
app.use(cors());

const s3 = new AWS.S3({
    accessKeyId: 'AKIAIBZ63RSDTHKMVTVA',
    secretAccessKey: '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',
    region: 'ap-south-1'
});
/* TODOS Routes */
app.post('/todos', authenticate, (req,res)=>{
   var todo = new Todo({
       text: req.body.text,
       _creator: req.user._id
   });

   todo.save()
       .then((result)=>{
       res.status(200).send(result)
   })
       .catch(e=>res.status(400).send())


});

app.get('/todos', authenticate, (req,res)=>{
    Todo.find({
        _creator: req.user._id
    })
        .then((todos)=>{
        res.status(200)
            .send({todos})
        })
        .catch(e=>res.status(400).send())
});

app.get('/todos/aggregation', authenticate, (req,res)=> {
    Todo.aggregate([ { $match : { $and: [ { _creator : req.user._id }, { completed: true } ]  } }])
        .then((todos) => {
            res.status(200).send(todos);
        })
        .catch(e=>res.status(404).send('Not'));
});

app.get('/todos/:id', authenticate, (req,res)=>{
    const id = req.params.id;

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo)=>{

        if(!todo){
            return res.status(404).send()
        }

        res.status(200).send({todo})
    })
        .catch(e=>res.status(400).send())
});

app.delete('/todos/:id', authenticate, (req,res) => {
    const id = req.params.id;

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {

        if(!todo){
            return res.status(404).send()
        }
        res.status(200).send({todo})
    }).catch(e=>res.status(400).send())
});

app.patch('/todos/:id', authenticate, (req,res) => {
    const id = req.params.id;
    var body = _.pick(req.body,['text', 'completed']);

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else{
        body.completedAt = null;
        body.completed = false;
    }

    Todo.findOneAndUpdate(
        {
            _id: id,
            _creator: req.user._id
        },
        {$set: body},
        {new: true})
        .then((todo)=>{
            if(!todo){
                return res.status(404).send()
            }
            res.status(200).send({todo})
        })
        .catch(e=>res.status(400).send())
});

/* Users Routes */

// POST /users
app.post('/users', (req, res)=>{
    var body = _.pick(req.body, ['name', 'email', 'password']);
    var user = new Users(body);

    user.save().then(()=>{
        return user.generatAuthToken()
    }).then((token)=>{
        res.header({'x-auth': token}).status(200).send(user);
    })
        .catch(e=>res.status(400).send(e))
});

// GET /me api
app.get('/users/me', authenticate, (req,res)=>{
    res.status(200).send(req.user);
});

// POST /users/login
app.post('/users/login', (req, res)=>{
    var body = _.pick(req.body,['email', 'password']);

    Users.findByCredentials(body.email, body.password).then((user)=>{
        console.log("credetials");
        return user.generatAuthToken().then((token)=>{
            console.log("ayht",token);
            console.log(user);
            res.header({'x-auth': token}).status(200).send(user);
        })
    })
        .catch((e)=>{
        console.log(e);
            res.status(400).send(e)
    })
});

//DELETE Log-out api
app.delete('/users/me/logout', authenticate, (req, res)=>{
   req.user.removeToken(req.token).then(()=>{
       res.status(200).send()
   }).catch(e=>res.status(400).send())
});

app.listen(port, ()=>{
    console.log("server is up on port : ", port);
});

app.get('/upload/image/file', authenticate, (req, res) => {
    console.log(req.user);
    let key = `${req.user._id}/${new Date().getTime()}.jpeg`;
    const signedUrlExpireSeconds = 60 * 60;
    s3.getSignedUrl('putObject',
        {
            Bucket: 'afzal-todo-bucket-123',
            Key: key,
            Expires: signedUrlExpireSeconds,
            ContentType: 'image/jpeg'
        }, function (err, url){
        if(err)
            res.status(400).send();
        else
            res.status(200).send({key, url})
    });
});


module.exports = {app};