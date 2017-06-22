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