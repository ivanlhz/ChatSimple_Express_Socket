var express = require('express'),
  config = require('./config/config');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('./config/express')(app, config);

server.listen(config.port, function () {
  console.log('Express server escuchando por el puerto ' + config.port);
});



//---------------- SOCKET.IO -----------------------------
var users = []; //Lista de usuarios conectados

io.on('connection',function(socket){
	socket.emit('conectado',users);

	socket.on('add_user',function(usuario){
		//Comprobamos que esté en la lista de usurios,
		//si está devolvemos error
		//sino agregamos a la lista de usuarios conectados y 
		//agregamos propiedad al objeto socket
		if( users.indexOf(usuario) != -1 || !usuario || usuario.trim().length == 0)
		{	
			socket.emit('error_msg','Usuario ya conectado,intenta con otro nombre de usuario.');		
		}else{
			socket.username = usuario;
			users.push(usuario);
			io.emit('conectado', users);
			socket.broadcast.emit('warning_msg', usuario + ' se ha conectado.');
			socket.emit('info_msg','Bienvenido ' + usuario + '!!');
			socket.emit('new_user');
		}
	});

	socket.on('msg',function(datos)
	{
		if(socket.username)//SI es un usuario conectado
		{
			io.emit('msg',datos);//Enviamos mensaje a todo el mundo
		}else{
			socket.emit('error_msg','Necesitas estar logeado.');
		}
	})
	socket.on('whisper',function(datos)
	{
		var encontrado = false;
		if(socket.username)//SI es un usuario conectado
		{
			//Recorremos el array de sockets conectados
			io.sockets.sockets.forEach(function(element)
			{			
				//Si encontramos el usuario le enviamos el mensaje.
				//Sino le enviamos mensaje de error.
				if(datos.userTarget == element.username)
				{
					element.emit('whisper', datos);
					encontrado = true;
				}
			});
			if(!encontrado){
				socket.emit('error_msg','No se ha encontrado el usuario.');
			}
		}else{
			socket.emit('error_msg','Necesitas estar logeado.');
		}
	})

	socket.on('disconnect',function(datos)
	{
		if(!socket.username) return;

		io.emit('warning_msg', socket.username +' desconectado.');//Le decimos a todos los clientes que se ha desconectado
		users.splice(users.indexOf(socket.username),1);//Borramos el usuario de la lista de usuarios
		delete socket.username; //Borramos la propiedad
		io.emit('conectado',users);//refrescamos la lista de usuarios en los clientes
	});
});