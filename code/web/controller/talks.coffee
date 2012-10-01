http.get '/сеть/беседы', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'talks', query: { участники: пользователь._id }, parameters: { sort: [['обновлено', -1]] } }, @.в 'беседы')
			
		.сделать ->
			пользовательское.подставить(@.$.беседы, 'участники', @)
			
		.сделать ->
			@.done(@.$.беседы)
			
		.все_вместе (беседа) ->
			db('messages').find({ общение: беседа._id, чего: 'беседы' }, { sort: [['_id', -1]], limit: 1 }).toArray(@)
			
		.сделать (последние_сообщения) ->
			сообщения = []
			for array in последние_сообщения
				if not array.пусто()
					сообщения.push(array[0])
			
			последние_сообщения = сообщения
			пользовательское.подставить(последние_сообщения, 'отправитель', @)
			
		.сделать (последние_сообщения) ->
			последние_сообщения.merge_into(@.$.беседы, 'последнее_сообщение', (беседа) -> @.общение + '' == беседа._id + '')
			
		#.сделать ->
			вывод.send @.$
			
options =
	id: 'talks'
	uri: '/беседа'
	data_uri: '/сеть/беседа/сообщения'
	
options.in_ether_id = 'беседы'
options.in_session_id = 'беседы'

options.правка_сообщения_чего = 'беседы'

options.создатель = (_id, возврат) ->
	if typeof _id == 'string'
		_id = db('talks').id(_id)
	
	цепь(возврат)
		.сделать ->
			db('messages').find({ общение: _id, чего: 'беседы' }, { sort: [['_id', 1]], limit: 1 }).toArray(@)
			
		.сделать (сообщения) ->
			if сообщения.пусто()
				return @.error("Не удалось проверить авторство")
				
			@.done(сообщения[0].отправитель)
		
options.messages_query = { чего: 'беседы' }

options.сообщения_чего = (ввод, возврат) ->
	цепь(возврат)
		.сделать ->
			if ввод.настройки._id?
				return db('talks').findOne({ _id: ввод.настройки._id }, @)
			
			db('talks').findOne({ id: ввод.настройки.id }, @)
			
		.сделать (сообщения_чего) ->
			result = Object.выбрать(['_id', 'название'], сообщения_чего)
			result.участники = сообщения_чего.участники.map((x) -> x.toString())
			@.done(result)
			
options.сообщения_чего_from_string = (сообщения_чего) ->
	if сообщения_чего._id.toHexString?
		return сообщения_чего
	сообщения_чего._id = db('talks').id(сообщения_чего._id)
	return сообщения_чего
			
options.messages_collection_id = 'messages'

options.messages_query = (environment) ->
	query = {}
	query.чего = 'беседы'
	if environment.сообщения_чего._id.toHexString?
		query.общение = environment.сообщения_чего._id
	else
		query.общение = collection.id(environment.сообщения_чего._id)
	query

options.extra_get = (data, environment, возврат) ->
	data.название = environment.сообщения_чего.название
	data.участники = environment.сообщения_чего.участники
	data._id = environment.сообщения_чего._id
	возврат()

options.mark_new = (сообщения, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.return() if not session?
			return @.return() if not session.новости?
			return @.return() if not session.новости.беседы?
				
			talk = environment.сообщения_чего._id.toString()
			return @.return() if not session.новости.беседы[talk]?
			
			for сообщение in сообщения
				if session.новости.беседы[talk].has(сообщение._id + '')
					сообщение.новое = yes
			
			@.done()

options.authorize = (environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('talks').findOne({ _id: environment.сообщения_чего._id }, @)
			
		.сделать (беседа) ->
			if not беседа.участники?
				throw { error: 'Вы не участвуете в этой беседе', display_this_error: yes }
			
			if not беседа.участники.map((_id) -> _id + '').has(environment.пользователь._id + '')
				throw { error: 'Вы не участвуете в этой беседе', display_this_error: yes }
			
			@.done()

options.earliest_in_news = (session, environment) ->
	if session.новости?
		if session.новости.беседы?
			if session.новости.беседы[environment.сообщения_чего._id]?
				return session.новости.беседы[environment.сообщения_чего._id][0]
	return

options.latest_read = (session, environment) ->
	if session.последние_прочитанные_сообщения?
		if session.последние_прочитанные_сообщения.беседы?
			return session.последние_прочитанные_сообщения.беседы[environment.сообщения_чего._id]
	return

options.notify = (_id, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('talks').findOne({ _id: environment.сообщения_чего._id }, @._.в 'беседа')
			
		.сделать (беседа) ->
			set_id = 'новости.беседы.' + environment.сообщения_чего._id.toString()
			add_to_set = {}
			add_to_set[set_id] = _id.toString()
			db('people_sessions').update({ $and: [ { пользователь: { $ne: environment.пользователь._id } }, пользователь: { $in: беседа.участники } ] }, { $addToSet: add_to_set }, { multi: yes }, @)
			
		.сделать ->	
			участники = @._.беседа.участники.map((_id) -> _id.toString())
			
			for участник in участники
				if участник != environment.пользователь._id.toString()
					эфир.отправить('новости', 'беседы', { _id: environment.сообщения_чего._id.toString(), сообщение: _id.toString() }, { кому: участник })

			for пользователь in эфир.пользователи()
				if пользователь != environment.пользователь._id + ''
					if !участники.has(пользователь)
						continue
					соединение_с_беседой = эфир.соединение_с('беседы', { пользователь: пользователь, _id: environment.сообщения_чего._id.toString() })
					if not соединение_с_беседой
						эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'беседы' }, { кому: пользователь })
						
			@.done()
		
		.сделать ->	
			#эфир.отправить(options.in_ether_id, 'сообщение', { где: environment.сообщения_чего._id.toString(), кем: пользовательское.поля(environment.пользователь) })
			@.done()

options.message_read = (_id, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			path = "последние_прочитанные_сообщения.беседы." + environment.сообщения_чего._id
			
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
			@._.set_id = 'новости.беседы.' + environment.сообщения_чего._id.toString()
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
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id, чего: 'беседы' }, @._.в 'сообщение')
	
		.сделать ->
			db('talks').update({ _id: environment.сообщения_чего._id }, { $set: { обновлено: new Date() } }, @)
			
		.сделать ->
			@.done(@._.сообщение)
	
result = messages.messages(options)
result.enable_message_editing('беседы')
result.enable_renaming('беседы')

append = (data, environment) ->
	data.участники = [environment.пользователь._id]
	data.создана = data.создано
	delete data.создано

result.enable_creation('беседа', append)

#result.enable_unsubscription('беседы')

http.delete '/сеть/' + 'беседы' + '/участие', (ввод, вывод, пользователь) ->
	_id = ввод.body._id
	
	цепь(вывод)
		.сделать ->
			db(options.id).update({ _id: db(options.id).id(_id) }, { $pull: { участники: пользователь._id } }, @)
			
		.сделать ->
			set_id = 'новости.' + options.in_session_id + '.' + _id
			db('people_sessions').update({ пользователь: пользователь._id }, { $unset: set_id }, @)
			
		.сделать ->
			новости.уведомления(пользователь, @)
			
		.сделать (уведомления) ->
			эфир.отправить('новости', 'уведомления', уведомления)
			вывод.send {}
		
добавить_в_беседу = (_id, добавляемый, пользователь, возврат) ->
	цепь(возврат)
		.сделать ->
			db(options.id).findOne({ _id: _id }, @)
			
		.сделать (беседа) ->
			нет_прав = yes
		
			if беседа.участники?
				for участник in беседа.участники
					if участник + '' == добавляемый + ''
						return вывод.send({ уже_участвует: yes })
					if участник + '' == пользователь._id + ''
						нет_прав = no
						
			if нет_прав
				return вывод.send(ошибка: "Вы не участник этой беседы, и поэтому \n не можете добавлять в неё людей")

			db(options.id).update({ _id: _id }, { $addToSet: { участники: добавляемый } }, @)
			
		.сделать ->
			db('people_sessions').findOne({ пользователь: добавляемый }, @)
			
		.сделать (session) ->
			query = { чего: 'беседы', общение: _id }
			
			latest_read = options.latest_read(session, { сообщения_чего: { _id: _id } })
			if latest_read?
				query._id = { $gt: latest_read }
				
			db('messages').find(query).toArray(@)
			
		.сделать (unread_messages) ->
			unread_message_ids = unread_messages.map((message) -> message._id.toString())
			
			эфир.отправить('новости', 'беседы', { _id: _id.toString(), сообщения: unread_message_ids }, { кому: добавляемый })
			
			set_id = 'новости.' + options.in_session_id + '.' + _id
			
			set_operation = {}
			set_operation[set_id] = { $each: unread_message_ids }
			
			db('people_sessions').update({ пользователь: добавляемый }, { $addToSet: set_operation }, @)
			
options.creation_extra = (_id, пользователь, ввод, возврат) ->
	кому = ввод.body.кому
	
	if not кому?
		return возврат()
	
	добавить_в_беседу(_id, db('people').id(кому), пользователь, возврат)
	
http.put  '/сеть/' + 'беседы' + '/участие', (ввод, вывод, пользователь) ->
	_id = db(options.id).id(ввод.body.беседа)
	добавляемый = db('people').id(ввод.body.пользователь)
	
	цепь(вывод)
		.сделать ->
			добавить_в_беседу(_id, добавляемый, пользователь, @)
			
		.сделать ->
			вывод.send {}