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
			@.done(сообщения_чего)
			#@.done({ _id: сообщения_чего._id.toString() })
			
options.messages_collection_id = 'messages'
options.messages_query = (environment) -> { общение: environment.сообщения_чего._id }

options.extra_get = (data, environment, возврат) ->
	data.название = environment.сообщения_чего.название
	data._id = environment.сообщения_чего._id
	возврат()
		
options.с_какого_выбрать = (ввод, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			return @.done() if not session.последние_прочитанные_сообщения?
			return @.done() if not session.последние_прочитанные_сообщения.обсуждения?
			@.done(session.последние_прочитанные_сообщения.обсуждения[environment.сообщения_чего._id])
			
options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id }, @.в 'сообщение')
			
		.сделать ->
			in_session_id = "последние_прочитанные_сообщения.обсуждения." + environment.сообщения_чего._id
			actions = {}
			actions.$set = {}
			actions.$set[in_session_id] = сообщение._id
			db('people_sessions').update({ _id: environment.пользователь._id }, actions, @)
		
		.сделать ->
			@.done(@.$.сообщение)
	
messages.messages(options)