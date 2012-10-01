options =
	id: 'chat'
	uri: '/болталка'
	data_uri: '/сеть/болталка/сообщения'

options.in_ether_id = 'болталка'

options.правка_сообщения_чего = 'болталки'

options.mark_new = (сообщения, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.return() if not session?
			return @.return() if not session.последние_прочитанные_сообщения?
			return @.return() if not session.последние_прочитанные_сообщения.болталка?
			
			for сообщение in сообщения
				if сообщение._id + '' > session.последние_прочитанные_сообщения.болталка + ''
					сообщение.новое = yes
			
			@.done()

options.earliest_in_news = (session) ->
	if session.новости?
		return session.новости.болталка
	return

options.latest_read = (session) ->
	if session.последние_прочитанные_сообщения?
		return session.последние_прочитанные_сообщения.болталка
	return

options.notify = (_id, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('people_sessions').update({ пользователь: { $ne: environment.пользователь._id } }, { $set: { 'новости.болталка': _id.toString() } }, { multi: yes }, @)
			
		.сделать ->
			эфир.отправить('новости', 'болталка', { _id: _id.toString() }, { кроме: environment.пользователь._id })
			for пользователь in эфир.пользователи()
				if пользователь != environment.пользователь._id + ''
					соединение_с_болталкой = эфир.соединение_с('болталка', { пользователь: пользователь })
					if not соединение_с_болталкой
						эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'болталка' }, { кому: пользователь })
			@.done()

options.message_read = (_id, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			path = 'последние_прочитанные_сообщения.болталка'
			
			actions = $set: {}
			actions.$set[path] = _id
			
			query =
				пользователь: environment.пользователь._id
				
			query.$or = [{}, {}]
			query.$or[0][path] = { $exists: no }
			query.$or[0][path] = { $lt: _id }
						
			db('people_sessions').update(query, actions, @)
			
		.сделать ->
			db('people_sessions').update({ пользователь: environment.пользователь._id, 'новости.болталка': _id.toString() }, { $unset: { 'новости.болталка': _id.toString() } }, @)
			
options.save = (сообщение, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('chat').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date() }, @._.в 'сообщение')
		
		.сделать (сообщение) ->
			db('people_sessions').update({}, { $set: { 'новости.болталка': @._.сообщение._id.toString() } }, { multi: yes }, @)
			
		.сделать ->
			@.done(@._.сообщение)
			
result = messages.messages(options)
result.enable_message_editing('болталка', { update: (_id, отправитель, content, возврат) -> db('chat').update({ _id: db('chat').id(_id), отправитель: отправитель }, $set: { сообщение: content }, возврат) })