var express = require('express');
var app = express();
let server = app.listen(process.env.PORT || 8080);
//var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
const request = new require('request');

users = [];
connections = [];


//server.listen(process.env.PORT || 8080);

console.log('server running...');

app.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html");
	console.log(io.sockets + " io io io io ");
})


io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('connected: %s sockets connected', connections.length);
	//Disconnect
	socket.on('disconnect', function(){
		//if(!socket.username) return;
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('disconnected: %s sockets connected', connections.length);
	});

	//Send message
	socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message', {msg: data, user:socket.username});
	});

	socket.on('ask robot', function(data, callback){
		callback(true);
		console.log(data);
		let botmessage;
    		if(data != ''){
			request('https://otto-brain.appspot.com/askBot/' + data, function (error, response_bot, body) {
	        		botmessage = response_bot.body;
	        		console.log("botmessage: " + botmessage);
	       			io.sockets.emit('new message', {msg: botmessage, user:"OTTO_"+socket.username});
			});
		}else{
			io.sockets.emit('new message', {msg: 'sagte alles Bruder', user:"OTTO_"+socket.username});
		}
    	
	});

	//New user
	socket.on('new user', (data, callback) => {
		console.log(data + " AAAAAEEEOO - " + users.includes(data));
		if(users.includes(data) || data == '' ){
			callback(false);
		}else{
			callback(true);
			socket.username = data;
			users.push(socket.username);
			updateUsernames();
			request('https://otto-brain.appspot.com/askBot/My name is '+ socket.username, function (error, response_bot, body) {
	    			botmessage = response_bot.body;
	    			console.log("botmessage: " + botmessage);
		    		io.sockets.emit('new message', {msg: botmessage, user:"OTTO_"+socket.username});
	    		});
		}
	});
});

function updateUsernames(){
	io.sockets.emit('get users', users);
};

