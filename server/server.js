/**
 * Created by Syed Afzal
 */
// configuartion of environment variables

var env = process.env.NODE_ENV || 'development';

console.log("env ___ :", env);

if(env == 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if(env == 'test'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

// 3rd party dependecies
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash')

// project models
var {mongoose} = require('../server/db');
var {Todo} = require('./models/todos/todo.model');
var {Users} = require('./models/users/user.model');
var {authenticate} = require('./middleware/authenticate');

var port = process.env.PORT;
var app = express();

app.use(bodyParser.json());

/* TODOS Routes */
app.post('/todos', (req,res)=>{
   var todo = new Todo({
       text: req.body.text
   });

   todo.save()
       .then((result)=>{
       res.status(200).send(result)
   })
       .catch(e=>res.status(400).send())


});

app.get('/todos', (req,res)=>{
    Todo.find()
        .then((todos)=>{
        res.status(200)
            .send({todos})
        })
        .catch(e=>res.status(400).send())
});

app.get('/todos/:id', (req,res)=>{
    const id = req.params.id;

    Todo.findById(id).then((todo)=>{

        if(!todo){
            return res.status(404).send()
        }

        res.status(200).send({todo})
    })
        .catch(e=>res.status(400).send())
});

app.delete('/todos/:id', (req,res) => {
    const id = req.params.id;

    Todo.findByIdAndRemove(id).then((todo) => {

        if(!todo){
            return res.status(404).send()
        }
        res.status(200).send({todo})
    }).catch(e=>res.status(400).send())
});

app.patch('/todos/:id', (req,res) => {
    const id = req.params.id;
    var body = _.pick(req.body,['text', 'completed']);

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else{
        body.completedAt = null;
        body.completed = false;
    }

    Todo.findByIdAndUpdate(id,
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
app.post('/users', (req, res)=>{
    var body = _.pick(req.body, ['name', 'email', 'password'])
    var user = new Users(body);

    user.save().then(()=>{
        return user.generatAuthToken()
    }).then((token)=>{
        res.header({'x-auth': token}).status(200).send(user);
    })
        .catch(e=>res.status(400).send(e))
});

app.get('/users/me', authenticate, (req,res)=>{
    res.status(200).send(req.user);
});

app.listen(port, ()=>{
    console.log("server is up on port : ", port);
});

module.exports = {app}

