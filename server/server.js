//this file is only responsable for our routes
require('./config/config')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT;



app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	//console.log(req.body);
	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});
});






//GET /todos/12345 
app.get('/todos/:id', (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send();
	}

	Todo.findById(id).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	});

});


//create a delete route

app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send("not valid bozo");
	}

	Todo.findByIdAndRemove(id).then((todo) => {
	  if (todo === null) {
	  	return res.status(404).send("cant find");
	  } 
	  res.send({todo});
}).catch((e) => {
		res.status(400).send(e);
	});

});

//patch is what you use when you want to update a resource
app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);//pick lets you pick single properties to update

	if (!ObjectID.isValid(id)) {
		return res.status(404).send("not valid bozo");
	}
	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;//when you want toremove a value from the database you can simply set it to null
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
	
});


app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User({
		email: body.email,
		password: body.password
	});

	//console.log(req.body);
	user.save().then(() => {
		// generating the token by calling the method and 
// adding it as a header
		return user.generateAuthToken();//we can return it  since we know we're expecting a chaining promise
	}).then((token) => {//this will be called with the token value
		res.header('x-auth', token).send(user);//we have everyhing we need to make the response, we have the user and we have the token 
		//header takes two arguments, the arguments are key value pairs/ the key is the header name and the value is what to set the header to
		//our header name is going to be x-auth, when you prefix a header name with x- means your making a custom header 
		//which means its not really a header that http supports by default, its a header your're using for specific purposes

	}).catch((e) => {
		res.status(400).send(e);
	})
});


app.listen(port, () => {
	console.log(`started up at ${port}`);
});



module.exports = {
	app: app
}