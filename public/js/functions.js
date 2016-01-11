$(document).ready(iniciar);

function iniciar()
{
	var socket = io();//Inicializamos el socket
	
	//Boton Susurrar
	$(document).on('click','.whisper',  function(event)
	{
		event.preventDefault();
		var target = $(this).attr("target");
		$("input[name='targetUser']").val(target);
		$('#send_msg').fadeOut('slow',function(){
			//Cuando termina el de desaparecer el cuadro de mensajes, aparece el cuadro de susurro
			$('#send_whisper').fadeIn('slow');
			$('#send_whisper input:first').focus();
		});
	});
	//Boton Cancel
	$('#btnCancel').on('click',function(){
		$('#send_whisper').fadeOut('slow',function(){
			//Cuando termina el de desaparecer el cuadro de mensajes, aparece el cuadro de susurro
			$('#send_msg').fadeIn('slow');
			$('#send_msg input:first').focus();
		});
	});
	//CHECKBOX MOstarr eventos
	$('#someSwitchOptionPrimary').change(function(){
		 if($(this).is(":checked")) {
			$('.infoMsg').fadeIn();
		 	$('.warningMsg').fadeIn();
		 }else{
		 	//Ocultamos todos los mensajes de informacion
		 	$('.infoMsg').fadeOut();
		 	$('.warningMsg').fadeOut();
		 }
	});
	$(document).on('appended','#chat-history .content',function(event,datos){
		$('#chat-history .content').append(datos);
		 if( $('#someSwitchOptionPrimary').is(":checked")){
		 	$('.infoMsg').fadeIn();
		 	$('.warningMsg').fadeIn();
		 }else{
		 	$('.infoMsg').hide();
		 	$('.warningMsg').hide();
		 }
	});

	//*************************************************
	//EVENTOS SUBMIT
	$('#conectar').on('submit',function(event)
	{
		event.preventDefault();
		socket.username = $("input[name='user_name']").val();
		socket.emit('add_user',$("input[name='user_name']").val() );
	});

	$('#send_msg').on('submit',function(event)
	{
		event.preventDefault();
		var tiempo = new Date();
		var hora = tiempo.getHours();
		var minuto = tiempo.getMinutes();

		socket.emit('msg',{ 
			username: socket.username,
			text: $("input[name='msg']").val() ,
			date: hora+':'+minuto
		});
		
		$("input[name='msg']").val('');//Borramos el contenido del mensaje enviado
	});
	$('#send_whisper').on('submit',function(event)
	{
		event.preventDefault();
		var tiempo = new Date();
		var hora = tiempo.getHours();
		var minuto = tiempo.getMinutes();

		socket.emit('whisper',{ 
			username: socket.username,
			text: $("input[name='whisper-msg']").val() ,
			userTarget: $("input[name='targetUser']").val(),
			date: hora+':'+minuto
		});
		
		$("input[name='whisper-msg']").val('');//Borramos el mensaje eviado
	});

	//*******************************************************
	//Recogidas de eventos del server
	socket.on('conectado',function(data){
		$('#chatters').empty();//Borramos la lista de usuarios y agregamos todos los usuarios conectados
		for(var i=0 ; i< data.length ; i++)
		{
			if(data[i] != socket.username)
			{
				$('#chatters').append('<p>'+data[i]+' - <a href="#" target="'+data[i]+'" class="whisper">Susurrar</a></p>');	
			}
		}
	});
	socket.on('new_user',function(data)
	{
		$('#conectar .input-group:first').fadeOut(1000,function(){
			$('#conectar .input-group:first').remove();
			$('nav .container').append('<p class="navbar-text navbar-right">Conectado como <strong>'+ socket.username +'</strong></p>');
		});
	})

	socket.on('msg',function(datos){
		if(datos.username == socket.username)
		{
			$('#chat-history .content').append("<p class='success'><small><i>"+datos.date+"</i></small> <strong>You</strong>: "+datos.text+"</p>");
		}else{
			$('#chat-history .content').append("<p class='blue'><small><i>"+datos.date+"</i></small> <strong>"+datos.username+"</strong>: "+datos.text+"</p>");
		}
		$('#chat-history').animate({scrollTop: $('#chat-history .content').height()}, 200);
	});
	socket.on('whisper',function(datos){
		$('#chat-history .content').append("<p class='alert alert-info'><small><i>"+datos.date+"</i></small><strong> "+datos.username+"</strong> Te ha susurrado :"+datos.text+"</p>");
		
		$('#chat-history').animate({scrollTop: $('#chat-history .content').height()}, 200);
	});

	socket.on('info_msg',function(msg)
	{
			$('#chat-history .content').trigger('appended','<div class="alert alert-info infoMsg"><strong>Info: </strong>'+msg +'</div>');
			$('#chat-history').animate({scrollTop: $('#chat-history .content').height()}, 200);
		
		
	});
	socket.on('error_msg',function(msg){
		
		$('#chat-history .content').append('<div class="alert alert-danger errorMsg"><strong>Error: </strong>'+msg +'</div>');
		$('#chat-history').animate({scrollTop: $('#chat-history .content').height()}, 200);
	});
	socket.on('warning_msg',function(msg){
		
		$('#chat-history .content').trigger('appended','<div class="alert alert-warning warningMsg">'+msg +'</div>');
		$('#chat-history').animate({scrollTop: $('#chat-history .content').height()}, 200);
		
	});
}