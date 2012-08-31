http.get '/сеть/беседы', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'talks', query: {} }, @.в 'беседы')
			
		.сделать ->
			пользовательское.подставить(@.$.беседы, 'участники', @)
			
		.сделать ->
			вывод.send @.$
			
options =
	id: 'talks'
	uri: '/беседа'
	data_uri: '/сеть/беседа/сообщения'
	
options.in_ether_id = 'беседы'
options.in_session_id = 'беседы'

options.сообщения_чего = (ввод, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			if ввод.настройки._id?
				return db('talks').findOne({ _id: ввод.настройки._id }, @)
			db('talks').findOne({ id: ввод.настройки.id }, @)
			
		.сделать (сообщения_чего) ->
			@.done(Object.выбрать(['_id', 'название'], сообщения_чего))
			
options.сообщения_чего_from_string = (сообщения_чего) ->
	if сообщения_чего._id.toHexString?
		return сообщения_чего
	сообщения_чего._id = db('talks').id(сообщения_чего._id)
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
			return @.done() if not session.последние_прочитанные_сообщения.беседы?
			@.done(session.последние_прочитанные_сообщения.беседы[environment.сообщения_чего._id])
			
options.notify = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('talks').findOne({ _id: environment.сообщения_чего._id }, @._.в 'беседа')
			
		.сделать (беседа) ->
			set_id = 'новости.беседы.' + environment.сообщения_чего._id.toString()
			add_to_set = {}
			add_to_set[set_id] = _id.toString()
			db('people_sessions').update({ $and: [ { пользователь: { $ne: environment.пользователь._id } }, пользователь: { $in: беседа.подписчики } ] }, { $addToSet: add_to_set }, { multi: yes }, @)
			
		.сделать ->	
			подписчики = @._.беседа.подписчики.map((_id) -> _id.toString())
			
			for подписчик in подписчики
				if подписчик != environment.пользователь._id.toString()
					эфир.отправить('новости', 'беседы', { _id: environment.сообщения_чего._id.toString(), сообщение: _id.toString() }, { кому: подписчик })

			for пользователь in эфир.пользователи()
				if пользователь != environment.пользователь._id + ''
					if !подписчики.has(пользователь)
						continue
					соединение_с_беседой = эфир.соединение_с('беседы', { пользователь: environment.пользователь._id, _id: environment.сообщения_чего._id.toString() })
					if not соединение_с_беседой
						эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'беседы' }, { кому: пользователь })
						
			@.done()

options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			path = "последние_прочитанные_сообщения.беседы." + environment.сообщения_чего._id
			
			actions = { $set: {} }
			actions.$set[path] = _id
			
			query = { пользователь: environment.пользователь._id }
			query[path] = { $lt: _id }
			
			db('people_sessions').update(query, actions, @)
			
		.сделать ->
			@._.set_id = 'новости.беседы.' + environment.сообщения_чего._id.toString()
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
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id }, @._.в 'сообщение')
	
		.сделать ->
			db('talks').update({ _id: environment.сообщения_чего._id }, { $addToSet: { подписчики: environment.пользователь._id }, $set: { обновлено: new Date() } }, @)
			
		.сделать ->
			@.done(@._.сообщение)
	
result = messages.messages(options)
result.enable_message_editing('беседы')
result.enable_unsubscription('беседы')