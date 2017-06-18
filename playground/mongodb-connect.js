//npm init to install npm in your project and package.json

//the first thing we need to do is pull something out of the library we just installed //the mongodg library
//we're looking for the mongo client
//the mongo client lets you connect to a mongo server and issue commands to let you
//manipulate the database 

//we're going to require the library we just installed called mongodb
//and from tht library we're going to pull off mongo client 
//const MongoClient = require('mongodb').MongoClient;

const {MongoClient, ObjectID} = require('mongodb');

//EXAMPLE:
//var obj = new ObjectID();//using this technique, we can incorporate object id's anywhere we'd like 
//console.log(obj);


//es6 object descructuring lets you pull out properties from an object creating variables
//es6 destructuring is a fantastic way to make new variables from an objects properties 
//EXAMPLE: 
// var user = {name: 'antonio', age: 25};
// var {name} = user;
// console.log(name);

//with the mongo client now in place we can all mongo client to connect to the database 
//in mongo db i can create a database by simply giving it a name before i start using it
//mongo is not going to create a database until we start adding stuff into it
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {//if there is a err the err msg and success msg will run 
		return console.log('Unable to connect to MongoDB server');//return err msg to prevent both from running
		//the return stops the program which means the success msg will not run if the if statement is called
	}   //the alternative would be to add else clause 
	console.log('Connected to MongoDB server');

//insert a new record into a collection 
	// db.collection('Todos').insertOne({
	// 	text: 'Something to do',
	// 	completed: false
	// }, (err, result) => {
	// 	if (err) {
	// 		return console.log('Unable to insert todo', err);
	// 	}
//result.ops stores all the docs that were inserted
	// 	console.log(JSON.stringify(result.ops, undefined, 2));
	// });

// 	db.close();//this closes the connection with the mongodb server

// });//this is a method and it takes two arguments
//the first argument is a string this is going to be the url where your database lives 
//in production this might be an amazon web service url (AWS) or a heroku url
//for our case its going to be that local host url

//the 2nd argument will be a callback function the callback function will fire after 
//the connection has either succeeded or failed 
//when we connect to a mongodb database we want to use the mongodb protocal mongodb://


// db.collection('Users').insertOne({
// 		name: 'Antonio',
// 		age: 25,
// 		location: 'Charlotte, NC'
// 	}, (err, result) => {
// 		if (err) {
// 			return console.log('Unable to insert user', err);
// 		}
// 		//console.log(JSON.stringify(result.ops, undefined, 2));
// 		console.log(result.ops[0]._id.getTimestamp());
//	});

	db.close();

});