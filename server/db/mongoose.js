var mongoose = require('mongoose');


//right here we tell mongoose we need to use the 
//built in promise library as opposed to some third party one 
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');


module.exports = {
	mongoose: mongoose
}