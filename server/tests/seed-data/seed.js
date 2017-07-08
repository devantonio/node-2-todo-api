const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const users = [{
	_id: userOneId,
	email: 'antonio@example.com',
	password: 'userOnePass',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
	}]

}, {
	_id: userTwoId,
	email: 'jen@example.com',
	password: 'userTwoPass',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
	}]

}];

const todos = [{
	_id: new ObjectId(),
	text: 'First test todo',
	_creator: userOneId
}, {
	_id: new ObjectId(),
	text: 'Second test todo',
	copmleted: true,
	completedAt: 333,
	_creator: userTwoId
}];

const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done());
};

const populateUsers = (done) => {
	User.remove({}).then(() => {
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		return Promise.all([userOne, userTwo]);//all of these promises have to resolve before the then callback gets called
	}).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};
