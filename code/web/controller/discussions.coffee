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
	
options.in_ether_id = 'обсуждения'
options.in_session_id = 'обсуждения'

options.правка_сообщения_чего = 'обсуждения'

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

options.messages_query = (environment) ->
	query = {}
	query.чего = 'обсуждения'
	if environment.сообщения_чего._id.toHexString?
		query.общение = environment.сообщения_чего._id
	else
		query.общение = collection.id(environment.сообщения_чего._id)
	query

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
			
options.notify = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('discussions').findOne({ _id: environment.сообщения_чего._id }, @._.в 'обсуждение')
			
		.сделать (обсуждение) ->
			set_id = 'новости.обсуждения.' + environment.сообщения_чего._id.toString()
			add_to_set = {}
			add_to_set[set_id] = _id.toString()
			db('people_sessions').update({ $and: [ { пользователь: { $ne: environment.пользователь._id } }, пользователь: { $in: обсуждение.подписчики } ] }, { $addToSet: add_to_set }, { multi: yes }, @)

		.сделать ->	
			подписчики = @._.обсуждение.подписчики.map((_id) -> _id.toString())
			
			for подписчик in подписчики
				if подписчик != environment.пользователь._id.toString()
					эфир.отправить('новости', 'обсуждения', { _id: environment.сообщения_чего._id.toString(), сообщение: _id.toString() }, { кому: подписчик })

			for пользователь in эфир.пользователи()
				if пользователь != environment.пользователь._id + ''
					if !подписчики.has(пользователь)
						continue
					соединение_с_обсуждением = эфир.соединение_с('обсуждения', { пользователь: environment.пользователь._id, _id: environment.сообщения_чего._id.toString() })
					if not соединение_с_обсуждением
						эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'обсуждения' }, { кому: пользователь })
						
			@.done()

options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			path = "последние_прочитанные_сообщения.обсуждения." + environment.сообщения_чего._id
			
			actions = { $set: {} }
			actions.$set[path] = _id
			
			query = { пользователь: environment.пользователь._id }
			query[path] = { $lt: _id }
			
			db('people_sessions').update(query, actions, @)
			
		.сделать ->
			@._.set_id = 'новости.обсуждения.' + environment.сообщения_чего._id.toString()
			pull = {}
			pull[@._.set_id] = _id.toString()
			db('people_sessions').update({ пользователь: environment.пользователь._id }, { $pull: pull }, @)

		.сделать ->
			query = { пользователь: environment.пользователь._id }
			query[@._.set_id] = []
			unset = {}
			unset[@._.set_id] = yes
			db('people_sessions').update(query, { $unset: unset }, @)
			
options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id, чего: 'обсуждения' }, @._.в 'сообщение')
	
		.сделать ->
			db('discussions').update({ _id: environment.сообщения_чего._id }, { $addToSet: { подписчики: environment.пользователь._id } }, @)
			
		.сделать ->
			@.done(@._.сообщение)
	
result = messages.messages(options)
result.enable_message_editing('обсуждения')
result.enable_unsubscription('обсуждения')