http.get '/сеть/обсуждения', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'discussions', query: {}, parameters: { sort: [['обновлено', -1]] } }, @.в 'обсуждения')
			
		.сделать ->
			пользовательское.подставить(@.$.обсуждения, 'участники', @)
			
		.сделать ->
			@.done(@.$.обсуждения)
			
		.все_вместе (обсуждение) ->
			db('messages').find({ общение: обсуждение._id, чего: 'обсуждения' }, { sort: [['_id', -1]], limit: 1 }).toArray(@)
			
		.сделать (последние_сообщения) ->
			сообщения = []
			for array in последние_сообщения
				if not array.пусто()
					сообщения.push(array[0])
			
			последние_сообщения = сообщения
			пользовательское.подставить(последние_сообщения, 'отправитель', @)
			
		.сделать (последние_сообщения) ->
			последние_сообщения.merge_into(@.$.обсуждения, 'последнее_сообщение', (обсуждение) -> @.общение + '' == обсуждение._id + '')
			
		#.сделать ->
			вывод.send @.$
			
options =
	id: 'discussions'
	uri: '/обсуждение'
	data_uri: '/сеть/обсуждение/сообщения'
	
options.in_ether_id = 'обсуждения'
options.in_session_id = 'обсуждения'

options.правка_сообщения_чего = 'обсуждения'

options.создатель = (_id, возврат) ->
	if typeof _id == 'string'
		_id = db('discussions').id(_id)
	
	цепь(возврат)
		.сделать ->
			db('messages').find({ общение: _id, чего: 'обсуждения' }, { sort: [['_id', 1]], limit: 1 }).toArray(@)
			
		.сделать (сообщения) ->
			if сообщения.пусто()
				return @.error("Не удалось проверить авторство")
				
			@.done(сообщения[0].отправитель)
		
options.сообщения_чего = (ввод, возврат) ->
	цепь(возврат)
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

options.mark_new = (сообщения, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.return() if not session?
			return @.return() if not session.новости?
			return @.return() if not session.новости.обсуждения?
				
			discussion = environment.сообщения_чего._id.toString()
			return @.return() if not session.новости.обсуждения[discussion]?
			
			for сообщение in сообщения
				if session.новости.обсуждения[discussion].has(сообщение._id + '')
					сообщение.новое = yes
			
			@.done()

options.earliest_in_news = (session) ->
	if session.новости?
		if session.новости.обсуждения?
			if session.новости.обсуждения[environment.сообщения_чего._id]?
				return session.новости.обсуждения[environment.сообщения_чего._id][0]
	return

options.latest_read = (session) ->
	if session.последние_прочитанные_сообщения?
		if session.последние_прочитанные_сообщения.обсуждения?
			return session.последние_прочитанные_сообщения.обсуждения[environment.сообщения_чего._id]
	return
			
options.notify = (_id, environment, возврат) ->
	цепь(возврат)
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
			
		.сделать ->
			#эфир.отправить(options.in_ether_id, 'сообщение', { где: environment.сообщения_чего._id.toString(), кем: пользовательское.поля(environment.пользователь) })
			@.done()
			
options.message_read = (_id, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			path = "последние_прочитанные_сообщения.обсуждения." + environment.сообщения_чего._id
			
			actions = $set: {}
			actions.$set[path] = _id
			
			query =
				пользователь: environment.пользователь._id
				
			query.$or = [{}, {}]
			query.$or[0][path] = { $exists: no }
			query.$or[0][path] = { $lt: _id }
			
			db('people_sessions').update(query, actions, @)
			
		.сделать ->
			# убрать новость из множества
			@._.set_id = 'новости.обсуждения.' + environment.сообщения_чего._id.toString()
			pull = {}
			pull[@._.set_id] = _id.toString()
			db('people_sessions').update({ пользователь: environment.пользователь._id }, { $pull: pull }, @)

		.сделать ->
			# удалять пустое множество новостей
			query = { пользователь: environment.пользователь._id }
			query[@._.set_id] = []
			unset = {}
			unset[@._.set_id] = yes
			db('people_sessions').update(query, { $unset: unset }, @)
			
options.save = (сообщение, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id, чего: 'обсуждения' }, @._.в 'сообщение')
	
		.сделать ->
			db('discussions').update({ _id: environment.сообщения_чего._id }, { $set: { обновлено: new Date() }, $addToSet: { подписчики: environment.пользователь._id } }, @)
			
		.сделать ->
			@.done(@._.сообщение)
	
result = messages.messages(options)
result.enable_message_editing('обсуждения')
result.enable_renaming('обсуждения')
result.enable_unsubscription('обсуждения')