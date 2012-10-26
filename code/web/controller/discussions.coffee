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
	общение: 'обсуждение'
	общение_во_множественном_числе: 'обсуждения'

options.правка_сообщения_чего = 'обсуждения'						

options.messages_query = (environment) ->
	query = {}
	query.чего = 'обсуждения'
	if environment.сообщения_чего._id.toHexString?
		query.общение = environment.сообщения_чего._id
	else
		query.общение = collection.id(environment.сообщения_чего._id)
	query

options.notified_users = (обсуждение) -> обсуждение.подписчики
	
options.save = (environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db(options.collection).update({ _id: environment.сообщения_чего._id }, { $addToSet: { подписчики: environment.пользователь._id } }, @)

result = messages.messages(options)
result.enable_message_editing('обсуждения')
result.enable_renaming('обсуждения')
result.enable_unsubscription('обсуждения')
result.enable_creation('обсуждение')