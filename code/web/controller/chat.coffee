options =
	id: 'chat'
	uri: '/болталка'
	data_uri: '/сеть/болталка/сообщения'
	
options.с_какого_выбрать = (ввод, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			@.done(session.последнее_сообщение_в_болталке)
	
options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('chat').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date() }, @.в 'сообщение')
			
		.сделать ->
			db('people').update({ _id: environment.пользователь._id }, { $set: { "session.последнее_сообщение_в_болталке": сообщение._id } }, @)
		
		.сделать ->
			@.done(@.$.сообщение)
	
messages.messages(options)