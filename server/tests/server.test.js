/**
 * Created by Syed Afzal
 */
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todos/todo.model');
const {Users} = require('../models/users/user.model')

const {populatedTodos, todos, populatedUsers, users} = require('./seed/seed');

beforeEach(populatedUsers);
beforeEach(populatedTodos);

describe('POST / todos', ()=>{
    it('should create a new todo', function(done){
        this.timeout(3000);
        var text = 'Something to test for';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .send({text})
            .expect((res)=>{
                expect(res.body.text).toBe(text)
            })
            .end((err, res)=>{
                if(err){
                    return done(err);
                }

                Todo.find({text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e=>done(e))
            })
    });

    it('should not create a todo', (done)=>{
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res)=>{
                if(err){
                    return done(err)
                }

                Todo.find()
                    .then((todos)=>{
                        expect(todos.length).toBe(2);
                        done();
                    }).catch(e=>done(e));
            })
    })
});

describe('GET / todos', ()=>{
    it('should get all todos in db', (done)=>{
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(1)
            })
            .end(done);
    })
});

describe('GET / todos:id', ()=>{
    it('should get a todo from db', (done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done);
    });

    it('should not return a todo from db created by other user', (done)=>{
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done)=>{
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })
});

describe('DELETE /todos/:id',  ()=>{
    it('it should delete a todo', (done)=>{
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo._id).toBe(hexId)
            })
            .end((err, res) => {
                if(err){
                    return done(err)
                };

                Todo.findById(hexId).then((todo)=>{
                    expect(todo).toBeFalsy();
                    done();
                })
                    .catch(e=>done(e));
            })
    })

    it('it should delete a todo created by other user', (done)=>{
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if(err){
                    return done(err)
                };

                Todo.findById(hexId).then((todo)=>{
                    expect(todo).toBeTruthy();
                    done();
                })
                    .catch(e=>done(e));
            })
    })

    it('it should 404 if todo not found', (done)=>{
        var hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })
});

describe('PATCH /todos/:id', ()=>{
    it('it should update a todo', (done)=>{
        var hexId = todos[0]._id.toHexString();
        var text = "This needs to change";
        let completed = true;
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .send({text, completed})
            .expect((res)=>{
                expect(res.body.todo._id).toBe(hexId)
            })
            .end((err, res)=>{
                if(err){
                    return done(err)
                }

                Todo.findById(hexId).then((todo)=>{
                        expect(todo.text).toBe(text)
                        expect(todo.completed).toBe(completed)
                        done();
                    })
            })
    })

    it('it should update a todo created by other user', (done)=>{
        var hexId = todos[1]._id.toHexString();
        var text = "This needs to change";
        let completed = true;
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .send({text, completed})
            .end((err, res)=>{
                if(err){
                    return done(err)
                }

                Todo.findById(hexId).then((todo)=>{
                    expect(todo.text).not.toBe(text)
                    expect(todo.completed).not.toBe(completed)
                    done();
                })
            })
    })

    it('should return 404 when todo not founr', (done)=>{
        var hexId = new ObjectID().toHexString();
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })
});

describe('GET /users/me', ()=>{
    it('should reutrn users if authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(users[0]._id.toHexString())
                expect(res.body.email).toBe(users[0].email)
            })
            .end(done)
    });

    it('should return 401 it not authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth', 'lkfhndfhfkdjh')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({})
            })
            .end(done);
    })
});

describe('POST /users', ()=>{
    it('should create a user', (done)=>{
        var name = 'Testing User';
        var email = 'testing@tesing.com';
        var password = 'testingpassword';
        request(app)
            .post('/users')
            .send({name, email, password})
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBeTruthy ();
                expect(res.headers['x-auth']).toBeTruthy ();
                expect(res.body.email).toBe(email)
            })
            .end(done);
    });

    it('should return validation errors if request is invalid', (done)=>{
        var name = 'Testing User';
        var email = 'testing';
        var password = 'testingpassword';
        request(app)
            .post('/users')
            .send({name, email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email is present', (done)=>{
        request(app)
            .post('/users')
            .send({
                name: 'abc',
                email: users[0].email,
                password: "abc123"
            })
            .expect(400)
            .end(done)
    });
});

describe('POST /user/login', ()=>{
    it('should login user and return auth token', (done)=>{
        request(app)
            .post('/users/login')
            .send({
                name:'login testing',
                email:users[1].email,
                password:users[1].password
            })
            .expect(200)
            .expect((res)=>{
                expect(res.headers['x-auth']).toBeTruthy ();
            })
            .end((err, res)=>{
                if(err){
                    return done(err)
                }

               Users.findById(users[1]._id).then((user)=>{
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                   done();
               }).catch((e)=> done(e))
            })
    })
});

describe('DELETE /users/me/logout', ()=>{
    it('should remove auth token', (done) => {
        request(app)
            .delete('/users/me/logout')
            .set('x-auth' , users[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{
                if(err){
                    return done(err)
                }

                Users.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0)
                    done();
                }).catch(e=>done(e))
            })
    })
});