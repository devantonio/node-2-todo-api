//JWT  (JSON WEB TOKEN)
const {SHA256} = require('crypto-js'); //256 is the number of bits
const jwt = require('jsonwebtoken');

var data = {
	id: 10
};

//this is the value that will be sent back to the user when they sign up or log in
//also the value that will be stored inside that tokens array
var token = jwt.sign(data, '123abc')//second argument takes the secret
console.log(token);

//verifies that the token was not altered
var decoded = jwt.verify(token, '123abc');//secret has to be the same
console.log('decoded', decoded);//iat is initiated at 






















// var message = 'I am user number 3';
// var hash = SHA256(message).toString();

// console.log(`message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
// 	id: 4
// };
// var token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// //salting the hash means you change something on the hash that makes it unique

// //MINIPULATING DATA
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
// 	console.log('Data was not changed');
// } else {
// 	console.log('Data was changed. do not trust!');
// }