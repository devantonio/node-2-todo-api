const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


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
UserSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = 'auth';
	//first argument takes a object of the data we want to sign
	//the second one is some secret value
	//this returns our object, im going call toString to get our string token
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