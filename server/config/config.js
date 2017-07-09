//bad idea to have your config data apart of your repository

var env = process.env.NODE_ENV || 'development';

//when you require json file it automatically parses the json into a javascrpt object
if (env === 'development' || env === 'test') {
	var config = require('./config.json');//now we have access to the config object
	var envConfig = config[env];
//console.log(envConfig);
	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	});
}

// if (env === 'development') {
// 	process.env.PORT = 3000;
// 	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// } else if (env === 'test') {
// 	process.env.PORT = 3000;
// 	process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }