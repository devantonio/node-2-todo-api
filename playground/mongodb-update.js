//update the mongodb database

const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server');
	} 
	console.log('Connected to MongoDB server');

    db.collection('Todos').findOneAndUpdate({
    	_id: new ObjectID('5946dee842e6eaf9c23bcce9')
    }, {
    	$set: {
    		completed: true
    	}
    }, {
    	returnOriginal: false
    }).then((result) => {
    	console.log(result);
    });



    db.collection('Users').findOneAndUpdate({
    	_id: new ObjectID('5946de7442e6eaf9c23bccc8')
    }, {
    	$set: {
    		name: 'Jill'
    	}, 
    	$inc: { 
    		age: -1
    	} 
    }, {
    	returnOriginal: false
    }).then((result) => {
    	console.log(result);
    });

//db.close();

});