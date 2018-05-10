/**
 * Created by Syed Afzal
 */
const {Todo} = require('./../../models/todos/todo.model');
const {Users} = require('./../../models/users/user.model');
const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');

const userOneID =  new ObjectID();
const userTwoID =  new ObjectID();
const users = [
    {
        _id: userOneID,
        name: "Syed Afzal Hasan",
        email: 'sah.afzal@gmail.com',
        password: 'abc123++',
        tokens : [
            {
                'access': 'auth',
                'token': jwt.sign({_id: userOneID.toHexString(), access: 'auth'}, 'thisismysecret').toString()
            }
        ]
    },
    {
        _id: userTwoID,
        name: "Syed Shaheer Hasan",
        email: 'sah.shaheer@gmail.com',
        password: 'abc123++',
    }
];

const populatedUsers = function (done) {
    this.timeout(3000);
    Users.remove({}).then(()=>{
        var userOne = new Users(users[0]).save();
        var userTwo = new Users(users[1]).save();
        return Promise.all([userOne,userTwo])
    }).then(()=>{done()})
        .catch(e=>done(e))
};

const todos = [
    {_id: new ObjectID(), text: "testing dummy todo 1"},
    {_id: new ObjectID(), text: "testing dummy todo 1"}
];

const populatedTodos = function(done) {
    this.timeout(3000);
    Todo.remove({}).then(()=> {
        return Todo.insertMany(todos);
    }).then(() => done())
        .catch(e=>done(e))
};


module.exports = {todos, populatedTodos, users, populatedUsers};
