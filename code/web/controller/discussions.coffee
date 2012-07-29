http.get '/сеть/обсуждения', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'discussions', query: {} }, @.в 'обсуждения')
			
		.сделать ->
			пользовательское.подставить(@.$.обсуждения, 'участники', @)
			
		.сделать ->
			вывод.send @.$
			
options =
	id: 'discussions'
	uri: '/обсуждение'
	data_uri: '/сеть/обсуждение/сообщения'
	
options.сообщения_чего = (ввод, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			if ввод.настройки._id?
				return db('discussions').findOne({ _id: ввод.настройки._id }, @)
			db('discussions').findOne({ id: ввод.настройки.id }, @)
			
		.сделать (сообщения_чего) ->
			@.done(Object.выбрать(['_id', 'название'], сообщения_чего))
			
options.сообщения_чего_from_string = (сообщения_чего) ->
	if сообщения_чего._id.toHexString?
		return сообщения_чего
	сообщения_чего._id = db('discussions').id(сообщения_чего._id)
	return сообщения_чего
			
options.messages_collection_id = 'messages'

options.messages_query = (collection, environment) ->
	if environment.сообщения_чего._id.toHexString?
		return { общение: environment.сообщения_чего._id }
	{ общение: collection.id(environment.сообщения_чего._id) }

options.extra_get = (data, environment, возврат) ->
	data.название = environment.сообщения_чего.название
	data._id = environment.сообщения_чего._id
	возврат()

options.latest_read_message = (environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			return @.done() if not session.последние_прочитанные_сообщения?
			return @.done() if not session.последние_прочитанные_сообщения.обсуждения?
			@.done(session.последние_прочитанные_сообщения.обсуждения[environment.сообщения_чего._id])
			
options.notificate = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').update({ пользователь: { $ne: environment.пользователь._id } }, { $addToSet: { 'новости.обсуждения': _id.toString() } }, @)
			
		.сделать ->	
			эфир.отправить_всем_кроме('новости', 'обсуждения', { болталка: _id.toString() }, environment.пользователь._id, @)

options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			actions = { $set: {} }
			actions.$set["последние_прочитанные_сообщения.обсуждения." + environment.сообщения_чего._id] = _id
			db('people_sessions').update({ пользователь: environment.пользователь._id }, actions, @)
			
		.сделать ->
			db('people_sessions').update({ пользователь: environment.пользователь._id }, { $pull: { 'новости.обсуждения': _id.toString() } }, @)

options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id }, @.в 'сообщение')
	
messages.messages(options)