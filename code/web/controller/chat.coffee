options =
	id: 'chat'
	uri: '/болталка'
	data_uri: '/сеть/болталка/сообщения'

options.in_ether_id = 'болталка'

options.правка_сообщения_чего = 'болталки'

options.latest_read_message = (environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			return @.done() if not session.последние_прочитанные_сообщения?
			@.done(session.последние_прочитанные_сообщения.болталка)
	
options.notify = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').update({ пользователь: { $ne: environment.пользователь._id } }, { $set: { 'новости.болталка': _id.toString() } }, { multi: yes }, @)
			
		.сделать ->
			эфир.отправить('новости', 'болталка', { _id: _id.toString() }, { кроме: environment.пользователь._id })
			for пользователь in эфир.пользователи()
				if пользователь != environment.пользователь._id + ''
					соединение_с_обсуждением = эфир.соединение_с('болталка', { пользователь: environment.пользователь._id })
					if not соединение_с_обсуждением
						эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'болталка' }, { кому: пользователь })
			@.done()

options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			actions = { $set: {} }
			actions.$set["последние_прочитанные_сообщения.болталка"] = _id
			db('people_sessions').update({ пользователь: environment.пользователь._id }, actions, @)
			
		.сделать ->
			db('people_sessions').update({ пользователь: environment.пользователь._id, 'новости.болталка': _id.toString() }, { $unset: { 'новости.болталка': _id.toString() } }, @)
			
options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('chat').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date() }, @._.в 'сообщение')
		
		.сделать (сообщение) ->
			db('people_sessions').update({}, { $set: { 'новости.болталка': @._.сообщение._id.toString() } }, { multi: yes }, @)
			эфир.отправить('новости', 'болталка', @._.сообщение._id.toString())
			
		.сделать ->
			@.done(@._.сообщение)
			
result = messages.messages(options)
result.enable_message_editing('болталка', { update: (_id, content, возврат) -> db('chat').update({ _id: db('chat').id(_id) }, $set: { сообщение: content }, возврат) })