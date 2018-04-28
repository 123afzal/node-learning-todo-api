/**
 * Created by Syed Afzal
 */
// 3rd party dependecies
var express = require('express');
var bodyParser = require('body-parser');

// project models
var {mongoose} = require('../server/db');
var {Todo} = require('./models/todos/todo.model');
var {Users} = require('./models/users/user.model');

var port = process.env.PORT || 3000;
var app = express();

app.use(bodyParser.json());

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

app.listen(port, ()=>{
    console.log("server is up on port : ", port);
});

module.exports = {app}

