var {User} = require('./../models/user');

//DEFINING OUR MIDDLEWARE FUNCTION
	//this will be the middleware function we use on our routes to make them private 
	//middleware takes 3 args
	//the actual route is not going to run until next gets called inside of the middleware
//THIS IS A REUSABLE FUNCTION 
var authenticate = (req, res, next)	=> {
	var token = req.header('x-auth');//getting the value of the header named x-auth//make a call to request.header to get to token

	//this is code we're going to use in mutiple place so we're 
	//going to turn to our user schema and create a model method 
	//its going to find the appropriate user related to that token
	//returning it into your promise callbacks
	//this means we'll be able to do something with the document 
	//of the user associated with the token
	//NEED TO DEFIND THIS MODEL METHOD OVER INSIDE USER.JS FIRST
	User.findByToken(token).then((user) => { //chained from user.js
		if (!user) {
			return Promise.reject();
		}

		req.user = user;//req.user is equal to the user we just found
		req.token = token;//set req.token equal to the token up above 
		next();
 	}).catch((e) => {
		//401 status means authentication is required 
		res.status(401).send();
	});
}

module.exports = {
	authenticate: authenticate
}