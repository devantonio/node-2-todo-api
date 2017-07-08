

//this file is only responsable for our routes
require('./config/config')

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;



app.use(bodyParser.json());



//to make this route private we have to add the authenticate middleware
//going to require that x-auth token is used 
//with authenticate in place we now have access to the user and the token that was used 
//all of that is configured in the authenticate middleware 
//that means, in our post todos route we can now set the creator property when we make our new todo
app.post('/todos', authenticate, (req, res) => {
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	//console.log(req.body);
	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

//authenticate is going to require that x-auth token is used when you're fetching todos 
app.get('/todos', authenticate, (req, res) => {
	Todo.find({
		//we're going to look for todos where the _creator property equals the id user that is currently authenticated 
		//now we're only going to be returning todos that the user, whose logged in  
		//actually created
		//that means if userOne add some todos, UserTwo is not going to beable to view them when
		//they try to fetch all of the todos
		//its nolonger all of the todos listed in the database, its now the todos for the currently 
		//logged in user
		_creator: req.user._id
	}).then((todos) => {
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

	Todo.findOne({
		_id: id,
		_creator: req.user.id
	}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	});

});


//create a delete route

app.delete('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;

	if (!ObjectID.isValid(id)) {
		return res.status(404).send("not valid bozo");
	}

	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
	  if (!todo) {
	  	return res.status(404).send("cant find");
	  } 
	  res.send({todo});
}).catch((e) => {
		res.status(400).send(e);
	});

});

//patch is what you use when you want to update a resource
app.patch('/todos/:id', authenticate, (req, res) => {
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

	Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
	
});

//this signup route will be public
//you get an auth x token back
//but you lose the token when you sign in from a different device
//cant login here because the email already exist
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
		res.header('x-auth', token).send(user);//send back id and email//we have everyhing we need to make the response, we have the user and we have the token 
		//header takes two arguments, the arguments are key value pairs/ the key is the header name and the value is what to set the header to
		//our header name is going to be x-auth, when you prefix a header name with x- means your making a custom header 
		//which means its not really a header that http supports by default, its a header your're using for specific purposes

	}).catch((e) => {
		res.status(400).send(e);
	})
});



//TURNING EXPRESS ROUTES INTO PRIVATE ROUTES
// THIS MEANS WE'LL REQUIRE AN X-AUTH TOKEN WE'RE GOING TO VALIDATE THAT TOKEN 
// WE'RE GOING TO FIND THE USER ASSOCIATED WITH THAT TOKEN
// THEN AND THEN WILL YOU WILL BE ABLE TO RUN THE ROUTE CODE




// USING EXPRESS MIDDLEWARE THAT DOES ALL OF THAT 
// VALIDATION AND VERIFICATION FOR US
//this route will require authentication 
//which means your going to need to provide a valid x-auth token
//its going tofind the associated user and its going to send that user back 
//much like we send the user back up above, send back the id and email
//NOW THAT WE HAVE THIS ONE ROUTE PRIVITIZED, WE WANT TO BREAK OUT THIS CODE INTO SOME MIDDLEWARE
//SO ALL OF OUR ROUTES CAN TAKE ADVANTAGE OF IT WITHOUT HAVING TO RUN ALL OF THESE FUNCTION CALLS
app.get('/users/me', authenticate, (req, res) => {//authenticate// now this route will be using the middleware up above
//now that we have request modified in our middleware 
//we can use that data by accessing it right here
	res.send(req.user);

});


//dedicated route for logging in users 
//trying to get a token so i can log in 
//we'll make a post request to /users/login
//when we make a post request to this route 
//we'll be sending along some data, the email in the request body and the 
//plain text password
//this means we're going to need to find the user in the mongodb collection 
//who one has a email matching the one that was sent in and 
//two has a hashed password that equals the plain text password when passed through
//the bcrypt compare method

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {//when the user is foun geneate the auth token
			//here we use x auth header to set the header, we set it equal to the token we just generated 
			//and we send the response body back as the user 
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {//catch err if cant find user
		res.status(400).send();
	});
});


//logout route need to delete the token of the currently logged in user 
//now your not going to  need to pass the token in via the body
//or some sort of url parameter 
//instead we're just going to make this route private 
//which means your're hoing to have to be authenticated to ever want to run the code
//in our authentiction middleware, we store the token used in req.token = token
//so we'll be able to grab that token value out 
//to add authentiction all we have to do is specify the authenticate middleware 
//just like we did for our other private route
//we define removeToken in user.js
app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});



app.listen(port, () => {
	console.log(`started up at ${port}`);
});



module.exports = {
	app: app
}