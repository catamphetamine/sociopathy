options =
	id: 'chat'
	uri: '/болталка'
	data_uri: '/сеть/болталка/сообщения'

options.in_ether_id = 'болталка'

options.latest_read_message = (environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			return @.done() if not session.последние_прочитанные_сообщения?
			@.done(session.последние_прочитанные_сообщения.болталка)
	
options.notificate = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').update({ пользователь: { $ne: environment.пользователь._id } }, { $set: { 'новости.болталка': _id.toString() } }, @)
			
		.сделать ->	
			эфир.отправить('новости', 'болталка', { _id: _id.toString() }, { кроме: environment.пользователь._id })
			if not эфир.есть_соединение('болталка')
				эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'болталка' }, { кроме: environment.пользователь._id })
			@.done()

options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			actions = { $set: {} }
			actions.$set["последние_прочитанные_сообщения.болталка"] = _id
			db('people_sessions').update({ пользователь: environment.пользователь._id }, actions, @)
			
		.сделать ->
			db('people_sessions').update({ пользователь: environment.пользователь._id, новости: { болталка: _id.toString() } }, { $unset: { 'новости.болталка': _id.toString() } }, @)

options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('chat').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date() }, @._.в 'сообщение')
		
		.сделать (сообщение) ->
			db('people_sessions').update({}, { $set: { 'новости.болталка': @._.сообщение._id.toString() } }, { multi: yes }, @)
			эфир.отправить('новости', 'болталка', @._.сообщение._id.toString())
			
		.сделать ->
			@.done(@._.сообщение)
			
messages.messages(options)