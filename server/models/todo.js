var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text: {
    	type: String,
    	required: true,
    	minlength: 1,
    	trim: true
	},
	completed: {
		type: Boolean,
		default: false //there's no reason to create a todo if its already done
	},
	completedAt: {
		type: Number,
		default: null
	},
	//the type is going to be an bject id. in order to set the type equal to an object id we're
	//going to  go into mongoose, we're going to access schema then we'll access the types object
	//and on there, there is a type object (ObjectId)
	//this is what we need to set our type to to set up the creator property
	//if a todo is going to be associated with a user we need a way to setup that association 
	//and that happens right here 
	//we store the id of the user 
	_creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	}
});


module.exports = {
	Todo: Todo
}






















//new todo
// var newTodo = new Todo({
// 	text: 'Cook dinner'
// });

// //will be responsable for saving our new todos to the database
// newTodo.save().then((doc) => {
// 	console.log('Saved todo', doc);
// }, (e) => {
// 	console.log('Unable to save todo');	
// });



// var newerTodo = new Todo({
// 	text: ' to do '
// });

// newerTodo.save().then((doc) => {
// 	console.log('Saved todo', doc);
// }, (e) => {
// 	console.log('Unable to save todo');	
// });