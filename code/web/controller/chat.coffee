options =
	id: 'chat'
	uri: '/болталка'
	data_uri: '/сеть/болталка/сообщения'
	
options.latest_read_message = (environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			return @.done() if not session.последние_прочитанные_сообщения?
			@.done(session.последние_прочитанные_сообщения.болталка)
	
options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			in_session_id = "последние_прочитанные_сообщения.болталка"
			actions = {}
			actions.$set = {}
			actions.$set[in_session_id] = _id
			db('people_sessions').update({ пользователь: environment.пользователь._id }, actions, @)
			
options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('chat').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date() }, @.в 'сообщение')
	
messages.messages(options)