const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


// will store the schema for a user 
// which means it will store the properties identical to the ones below in the user model
//this is what we need to tack on the custom methods.
//we cant add methods on to user so we have to switch power generating the model

//the schema takes a object and on that object we define all the attributes for our document
var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,//you be able to ahve two documents in the user collection with the same email
		validate: {
			validator: validator.isEmail
			},
			message: '{VALUE} is not a valid email'
		},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});



//this method which we're going to defnd as a regular function determines what exactly 
//gets sent back when a mongoose model(user model) is converted into a JSON value
UserSchema.methods.toJSON = function () {
	var user = this;
	//user.toObject is resposible for taking your mongoose variable (user) and conveting it to a regular object
	//where only the properties available on the document exists
	var userObject = user.toObject();
//return the id and email. leaving off the token and password
	return _.pick(userObject, ['_id', 'email']);

};


//UserSchema.methods is an object and on this object we can add any method we'd like 
//this are going to be your instance methods
//in this case we're going to be adding a instance method called generateAuthToken 
//your instance methods do have access to the individual document 
//which is great because we need that info to create our json web token

//i will be using a regular function becasue i will be binding a this keyword and arrow functions do not 
//bind a this keyword
//we need a this keyword for our methods because the this keyword stores the individual document
//which means we can create variable called user and setting it equal to this 
UserSchema.methods.generateAuthToken = function () {//instance method
	var user = this;
	var access = 'auth';
	//first argument takes a object of the data we want to sign
	//the second one is some secret value
	//this returns our object, im going call toString to get our string token
	//have to sign the token with jwt.sign
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

//update the users token array
//tokens is an empty array by default
	user.tokens.push({
		access: access,
		token: token
	});

	//in order to save these updates call user.save();
	//user.save(); returns a promise 

	//in order for server.js to chain //onto the promise we will return this
	return user.save().then(() => {
		//pass in my success callback function 
		//and all we're going to do is return the token 
		//this is the variable we defined above

		return token;
	});//and we're going to do this so later on in the server file we can grab the token 
		//by taking on another then callback
		//.then((token) => {//getting access to the token
//and then responding inside of the callback function
		//});//this then statment is going to happen in server js, in order for server.js to chain 
		//onto the promise we will return this

		//we're returning a value and that value will get passed as an success argument 
		//for the next then call
};

UserSchema.methods.removeToken = function (token) {
	//$pull is a mongodb method it lets you remove items from an array that match a cdrtain criteria 
	var user = this;

	return	user.update({//return tolet us chain together our call thats in serve.js
			$pull: {
				tokens: {
					token: token
				}
			}
	});
};

//.statics is a object kind of like methods although everything you add on to it turns into a model
//method as oppose to a instance method
UserSchema.statics.findByToken = function (token) {
	//instance methods get called with the individual document
	//model methods gets called as the this binding 
	var User = this;

	var decoded; //this will store the decoded jwt values in hashing.js
					//going to be the return result from jwt.verify(token, '123abc');
//decoded is left undefined because jwt.verify will throw an error if anything goes wrong
//if the secret doesnt match the secret the token was created with or if the token value was manipulated
//that means we wantto be able to catch this error and do something with it
//to do that we're going to use a try catch block
//if any errors happen in the try block 
//the code automatically stops execution and moves into the catch block 
//lets you run some code there  and then it continues on with your program

	try {
		decoded = jwt.verify(token, 'abc123');//we want to try jwt.verify to see if it throws an error
	}	catch (e) {
		//this promise will get returned from find by token 
		//then over inside of server.js it will get rejected so our the success case in server.js
		//will never fire.the catch callback will though(in server.js)
		// return new Promise((resolve, reject) => {
		// 	reject();
		// });
		//SIMPLIFIED ABOVE
		return Promise.reject();//i can also pass in value that will reject with a msg that will get
		//passed to the error in catch when sending user in server.js
	}		
	//if we are able to successfully decode the token that was passed in as the header 
	//we are going to call User.findOne to find the associated user if any 
	//this going to return a promise 
	//and we're going to return that in order to add some chaining 
	//that means we can add a then call onto find by token over in server.js

	return User.findOne({
		//first thing we're looking for is the id
		//looking for a user with the _id: property equals the one we have in decoded._id
		'_id': decoded._id,
		//we need to find a user whose token array has an object where the token property 
		//equals the the token property we have passed into this function 
		//to query a nested document 
		//we're going to wrap our value in quotes
		//this lets us query that value 
//QUOTES ARE REQUIRED WHEN YOU HAVE A DOT IN THE VALUE
		'tokens.token': token,//we want to find a value thats equal to the token argument thats passed in above
		//we're going to do the exact same with access we're looking for a user 
		//where in their tokens array the access property is set to auth
		'tokens.access': 'auth'
	});
};

UserSchema.statics.findByCredentials = function (email, password) {
	var User = this;

	return User.findOne({email}).then((user) => {
		if(!user) {
			return Promise.reject(); //this will trigger the catch call in server.js
		}

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if (res === true) {
					resolve(user);
				} reject(err);//this will trigger the catch case in server.js
			
			});
		});
	});
};


UserSchema.pre('save', function (next) {
	var user = this;

//now we can check if the password was modified
//this is a really important thing 
//theres going to be times where we save the document 
//and we're never going to have updated the password
//which mmeans the password will already be hashed 
//imagine i save a document with a plain text password
//then the password gets hashed 
//later on i update something thats not the password like the email
//this middleware is going to run again 
//that means we're going to hash our hash and the program is going to break 
//we're going to use a method available on our instance 
//thats called user.isModified 
//returns true if password is modified returns false if the password hasnt been modified 
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
 		bcrypt.hash(user.password, salt, (err, hash) => {
		user.password = hash;
		next();
 	});
 });
	} else {
		next(); //moving on with the middleware
	}

});

var User = mongoose.model('User',UserSchema);


module.exports = {
	User: User
}




























// var user = new User({
// 	email: 'antonio@example.com    '
// });

// user.save().then((doc) => {
// 	console.log('User saved', doc);
// }, (e) => {
// 	console.log('Unable to save user', e);
// });