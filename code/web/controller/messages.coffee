exports.messages = (options) ->

	if options.общение_во_множественном_числе?
		options.messages_collection = 'messages'
		options.path = (environment) -> options.общение_во_множественном_числе + '.' + environment.сообщения_чего._id
		options.path_query = (value, environment) ->
			query = {}
			query[options.общение_во_множественном_числе] = {}
			query[options.общение_во_множественном_числе][environment.сообщения_чего._id] = value
			query
	else
		options.messages_collection = options.id
		options.path = (environment) -> options.общение
		options.path_query = (value, environment) ->
			query = {}
			query[options.общение] = value
			query
		
	options.uri = '/' + options.общение
	options.data_uri = '/сеть/' + options.общение + '/сообщения'

	save = options.save
	options.save = (сообщение, environment, возврат) ->
		data =
			отправитель: environment.пользователь._id
			сообщение: сообщение
			когда: new Date()
			
		if options.общение_во_множественном_числе?
			data.общение = environment.сообщения_чего._id
			data.чего = options.общение
				
		цепь(возврат)
			.сделать ->
				db(options.messages_collection).save(data, @._.в 'сообщение')
				
			.сделать ->
				if options.общение_во_множественном_числе?
					return db(options.collection).update({ _id: environment.сообщения_чего._id }, { $set: { обновлено: data.когда } }, @)
				@.done()

			.сделать ->
				if save?
					return save(@._.сообщение, environment, @)
				@.done()
				
			.сделать ->
				@.done(@._.сообщение)
				
	options.сообщения_чего_from_string = (сообщения_чего) ->
		if сообщения_чего._id.toHexString?
			return сообщения_чего
		сообщения_чего._id = db(options.collection).id(сообщения_чего._id)
		return сообщения_чего

	options.notify = (_id, environment, возврат) ->
		цепь(возврат)
			.сделать ->
				if options.общение_во_множественном_числе?
					return db(options.collection).findOne({ _id: environment.сообщения_чего._id }, @)
				@.done()
				
			.сделать (общение) ->
				query = { последние_сообщения: options.path_query({ $lt: _id }, environment) }
				
				users = []
				if options.notified_users?
					users = options.notified_users(общение)
					query.пользователь = { $in: users }
				
				setter = {}
				setter['последние_сообщения.' + options.path(environment)] = _id
				
				db('people_sessions').update(query, { $set: setter }, { multi: yes })
				
				@.done(users.map((_id) -> _id.toString()))
				
			.сделать (users) ->
				if not users.пусто()
					for user in users
						if user != environment.пользователь._id.toString()
							эфир.отправить('новости', options.общение, { _id: environment.сообщения_чего._id.toString(), сообщение: _id.toString() }, { кому: user })
				else	
					эфир.отправить('новости', options.общение, { _id: _id.toString() }, { кроме: environment.пользователь._id })

				for пользователь in эфир.пользователи()
					if пользователь != environment.пользователь._id + ''
						if !users.пусто() && !users.has(пользователь)
							continue
						
						criteria = { пользователь: пользователь }
						if environment.сообщения_чего?
							criteria._id = environment.сообщения_чего._id.toString()
							
						соединение_с_общением = эфир.соединение_с(options.общение, criteria)
						if not соединение_с_общением
							эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: options.общение }, { кому: пользователь })
							
				@.done()

	options.mark_new = (сообщения, environment, возврат) ->
		цепь(возврат)
			.сделать ->
				db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
				
			.сделать (session) ->
				path = 'последние_прочитанные_сообщения.' + options.path(environment)
				latest_read = Object.path(session, path)
				
				if not latest_read?
					for сообщение in сообщения
						сообщение.новое = yes
					return @.return()
					
				for сообщение in сообщения
					if сообщение._id + '' > latest_read + ''
						сообщение.новое = yes
				
				@.done()
					
	сообщения_чего = options.сообщения_чего
				
	options.сообщения_чего = (ввод, возврат) ->
		цепь(возврат)
			.сделать ->
				if ввод.настройки._id?
					return db(options.collection).findOne({ _id: ввод.настройки._id }, @)
				
				db(options.collection).findOne({ id: ввод.настройки.id }, @)
				
			.сделать (сообщения_чего) ->
				result = Object.выбрать(['_id', 'название'], сообщения_чего)
				if сообщения_чего?
					сообщения_чего(result, сообщения_чего)
				@.done(result)
				
	extra_get = options.extra_get
	
	options.extra_get = (data, environment, возврат) ->
		data.название = environment.сообщения_чего.название
		data._id = environment.сообщения_чего._id
		if extra_get?
			extra_get(data, environment)
		возврат()
		
	options.создатель = (_id, возврат) ->
		if typeof _id == 'string'
			_id = db(options.id).id(_id)
		
		цепь(возврат)
			.сделать ->
				db('messages').find({ общение: _id, чего: options.общение }, { sort: [['_id', 1]], limit: 1 }).toArray(@)
				
			.сделать (сообщения) ->
				if сообщения.пусто()
					return @.error("Не удалось проверить авторство")
					
				@.done(сообщения[0].отправитель)

	options.latest_read = (session, environment) ->
		return Object.path(session, 'последние_прочитанные_сообщения.' + options.path(environment))

	options.message_read = (_id, environment, возврат) ->
		path = 'последние_прочитанные_сообщения.' + options.path(environment)
				
		цепь(возврат)
			.сделать ->
				query = { пользователь: environment.пользователь._id }
				
				query.$or = []
				query.$or.push({ последние_прочитанные_сообщения: options.path_query({ $lt: _id }, environment) })
				query.$or.push({ последние_прочитанные_сообщения: options.path_query({ $exists: 0 }, environment) })
					
				actions = $set: {}
				actions.$set[path] = _id
							
				db('people_sessions').update(query, actions, @)

	connected = redis.createClient()
			
	цепь()
		.сделать ->
			connected.del(options.id + ':connected', @)
			
		.сделать ->
			collection = db(options.messages_collection)
									
			these_messages_query = (query, environment) ->
				if not options.messages_query?
					return query
				
				Object.merge_recursive(Object.clone(query), options.messages_query(environment))

			соединения = {}
			
			connection = websocket
				.of(options.uri)
				.on 'connection', (соединение) ->
					соединения[соединение.id] = соединение
					эфир.соединения[options.общение][соединение.id] = соединение
					environment = {}
			
					connected_data_source = ->
						if not environment.сообщения_чего?
							return options.id + ':connected'
						options.id + ':' + environment.сообщения_чего._id + ':connected'
			
					broadcast = (id, content) ->
						if not environment.сообщения_чего?
							if соединение?
								return соединение.broadcast.emit(id, content)
							
						connected_clients = соединение.manager.rooms[options.uri + '/' + environment.сообщения_чего._id + '']
						if connected_clients?
							for connection_id in connected_clients
								if соединения[connection_id]?
									if соединения[connection_id] != соединение
										соединения[connection_id].emit(id, content)
						#websocket.sockets.in(environment.сообщения_чего._id + '').emit()
			
					disconnected = false
					пользователь = null
					
					выход = ->
						delete соединения[соединение.id]
						delete эфир.соединения[options.общение][соединение.id]
					
						finish_disconnection = () ->
							disconnected = true
							соединение.disconnect()
					
						if пользователь?
							цепь(соединение)
								.сделать ->
									connected.hdel(connected_data_source(), пользователь._id, @)
									
								.сделать ->
									broadcast('отцепился', пользовательское.поля([], пользователь))
									finish_disconnection()
						else
							finish_disconnection()
							
					соединение.on 'выход', () ->
						if not disconnected
							выход()
						
					соединение.on 'disconnect', () ->
						if not disconnected
							выход()
					
					соединение.on 'пользователь', (тайный_ключ) ->
						цепь(соединение)
							.сделать ->
								пользовательское.опознать(тайный_ключ, @.в 'пользователь')
							
							.сделать (user) ->
								if not user?
									return send(ошибка: 'Пользователь не найден: ' + тайный_ключ)
									
								пользователь = user
								environment.пользователь = пользователь
								соединение.пользователь = { _id: пользователь._id }
								
								соединение.emit 'пользователь подтверждён'

					соединение.on 'environment', (environment_data) ->
						if environment_data.сообщения_чего?
							соединение.join(environment_data.сообщения_чего._id + '')
							if not соединение.custom_data?
								соединение.custom_data = {}
							соединение.custom_data._id = environment_data.сообщения_чего._id + ''
							environment.сообщения_чего = options.сообщения_чего_from_string(environment_data.сообщения_чего)

						соединение.emit 'environment received'
						
					соединение.on 'finish', ->
						finish = () ->
							соединение.on 'кто здесь?', ->
								цепь(соединение)
									.сделать ->
										connected.hgetall(connected_data_source(), @)
										
									.сделать (who_is_connected) ->
										who_is_connected_info = []
										for id, json of who_is_connected
											if id + '' != пользователь._id + ''
												who_is_connected_info.push(JSON.parse(json))
												
										соединение.emit 'кто здесь', who_is_connected_info
							
							соединение.on 'получить пропущенные сообщения', (с_какого) ->
								цепь(соединение)
									.сделать ->
										collection.find(these_messages_query({ _id: { $gte: collection.id(с_какого._id) } }, environment), { sort: [['_id', 1]] }).toArray(@.в 'сообщения')
									
									.сделать ->
										пользовательское.подставить(@.$.сообщения, 'отправитель', @)
									
									#.сделать ->
									#	if options.mark_new?
									#		return options.mark_new(@.$.сообщения, environment, @)
									#	@.done()
									
									.сделать ->
										соединение.emit('пропущенные сообщения', @.$.сообщения)
									
							соединение.on 'смотрит', () ->
								broadcast('смотрит', пользовательское.поля(пользователь))
									
							соединение.on 'не смотрит', () ->
								broadcast('не смотрит', пользовательское.поля(пользователь))
							
							соединение.on 'вызов', (_id) ->
								цепь(соединение)
									.сделать ->
										if not эфир.отправить('общее', 'вызов', пользовательское.поля(пользователь), { кому: _id })
											return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
							
							соединение.on 'пишет', ->
								broadcast('пишет', пользовательское.поля([], пользователь))
							
							соединение.on 'сообщение', (сообщение) ->
								цепь(соединение)
									.сделать ->
										options.save(сообщение, environment, @._.в 'сообщение')
										
									.сделать ->
										options.message_read(@._.сообщение._id, environment, @)
										
									.сделать ->
										if options.subscribe?
											return options.subscribe(environment, @)
										@.done()
										
									.сделать ->
										options.notify(@._.сообщение._id, environment, @)
										
									.сделать ->
										db(options.messages_collection).find(these_messages_query({ _id: { $lt: @._.сообщение._id } }, environment), { limit: 1, sort: [['_id', -1]] }).toArray(@)
										
									.сделать (предыдущие_сообщения) ->
										if предыдущие_сообщения.пусто()
											throw 'Previous message not found'
											
										данные_сообщения =
											_id: @._.сообщение._id.toString()
											отправитель: пользовательское.поля(пользователь)
											сообщение: @._.сообщение.сообщение
											когда: @._.сообщение.когда
											предыдущее: предыдущие_сообщения[0]._id.toString()
										
										соединение.emit('сообщение', данные_сообщения)
										broadcast('сообщение', данные_сообщения)
																						
							соединение.on 'прочитано', (_id) ->
								цепь(соединение)
									.сделать ->
										options.message_read(collection.id(_id), environment)
											
										сообщения_чего = null
										if environment.сообщения_чего?
											сообщения_чего = environment.сообщения_чего._id.toString()
											
										эфир.отправить('новости', 'прочитано', { что: options.общение, сообщения_чего: сообщения_чего, _id: _id.toString() })

							цепь(соединение)
								.сделать ->
									connected.hset(connected_data_source(), пользователь._id.toString(), JSON.stringify(пользовательское.поля(пользователь)), @)
								
								.сделать ->
									broadcast('подцепился', пользовательское.поля(пользователь))
									соединение.emit 'готов'
									
						if options.authorize?
							цепь(соединение)
								.сделать ->
									options.authorize(environment, @)
								.сделать ->
									finish()
						else
							finish()
							
					соединение.emit 'поехали'
					
			show_from = (environment, возврат) ->
				цепь(возврат)
					.сделать ->
						db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
						
					.сделать (session) ->
						return @.done() if not session?
						return @.done(options.latest_read(session, environment))
					
			http.get options.data_uri, (ввод, вывод, пользователь) ->
				environment = {}
				environment.пользователь = пользователь
					
				loading_options =
					collection: options.messages_collection
							
				цепь(вывод)
					.сделать ->
						if options.сообщения_чего?
							return цепь(@)
								.сделать ->
									options.сообщения_чего(ввод, @)
								.сделать (сообщения_чего) ->
									environment.сообщения_чего = сообщения_чего
									@.done()
						@.done()
						
					.сделать ->
						if options.authorize?
							return options.authorize(environment, @)
						@.done()
						
					.сделать ->
						if not ввод.настройки.после?
							return цепь(@)
								.сделать ->
									show_from(environment, @)
									
								.сделать (show_from) ->
									loading_options.с = show_from
									@.done()
						@.done()
						
					.сделать ->
						loading_options.query = these_messages_query({}, environment)

						снасти.either_way_loading(ввод, loading_options, @)
									
					.сделать (result) ->
						@.$.сообщения = result.data
						@.$['есть ещё?'] = result['есть ещё?']
						@.$['есть ли предыдущие?'] = result['есть ли предыдущие?']
						
						пользовательское.подставить(@.$.сообщения, 'отправитель', @)
												
					.сделать ->
						if options.extra_get?
							return options.extra_get(@.$, environment, @)
						@.done()
						
					.сделать ->
						if ввод.настройки.первый_раз?
							if options.создатель?
								if environment.сообщения_чего?
									return options.создатель(environment.сообщения_чего._id, @.в 'создатель')
						@.done()

					.сделать ->
						if options.mark_new?
							return options.mark_new(@.$.сообщения, environment, @)
						@.done()
					
					.сделать ->
						@.$.environment =
							пользователь: пользовательское.поля(['_id'], пользователь)
							сообщения_чего: environment.сообщения_чего
						
						for сообщение in @.$.сообщения
							сообщение._id = сообщение._id.toString()
							
						вывод.send(@.$)
					
	result = {}
	
	initial_options = options
	
	result.enable_message_editing = (url, options) ->
		options = options || {}
		
		http.post '/сеть/' + url + '/сообщения/правка', (ввод, вывод, пользователь) ->
			цепь(вывод)
				.сделать ->
					@.done(JSON.parse(ввод.body.messages))
					
				.все_вместе (data) ->
					@._.data = data
					
					if options.update?
						options.update(data._id, пользователь._id, data.content, @)
					else
						_id = db('messages').id(data._id)
						db('messages').update({ _id: _id, отправитель: пользователь._id }, { $set: { сообщение: data.content } }, @)
					
				.сделать ->
					if !options.update?
						_id = db('messages').id(@._.data._id)
						return db('messages').findOne({ _id: _id }, @._.в 'message')
					@.done()
						
				.сделать ->
					data = { _id: @._.data._id, сообщение: @._.data.content }
					if @._.message?
						data.чего_id = @._.message.общение
					data.чего = initial_options.правка_сообщения_чего
					эфир.отправить('сообщения', 'правка', data, { кроме: пользователь._id })
					вывод.send {}
					
	result.enable_unsubscription = (url) ->
		http.delete '/сеть/' + url + '/подписка', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			
			цепь(вывод)
				.сделать ->
					db(options.id).update({ _id: db(options.id).id(_id) }, { $pull: { подписчики: пользователь._id } }, @)
					
				.сделать ->
					set_id = 'последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })
					db('people_sessions').update({ пользователь: environment.пользователь._id }, { $unset: set_id }, @)
					
				.сделать ->
					новости.уведомления(пользователь, @)
					
				.сделать (уведомления) ->
					эфир.отправить('новости', 'уведомления', уведомления)
					вывод.send {}
		
	result.enable_renaming = (url) ->
		http.post '/сеть/' + url + '/переназвать', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			название = ввод.body.название.trim()
			
			цепь(вывод)
				.сделать ->
					options.создатель(_id, @)
				
				.сделать (создатель) ->
					if создатель + '' != пользователь._id + ''
						return вывод.send { ошибка: "Вы не создатель этого общения, и не можете его переименовать" }
						
					db(options.id).update({ _id: db(options.id).id(_id) }, { $set: { название: название } }, @)
					
				.сделать ->
					эфир.отправить(options.общение, 'переназвано', { _id: _id, как: название })
					вывод.send {}
				
	result.enable_creation = (url, append) ->
		http.put '/сеть/' + url, (ввод, вывод, пользователь) ->
			название = ввод.body.название.trim()
			сообщение = ввод.body.сообщение
			
			environment =
				пользователь: пользователь
				
			цепь(вывод)
				.сделать ->
					проверка = (id, возврат) ->
						цепь(возврат)
							.сделать ->
								db(options.id).findOne({ id: id }, @)
								
							.сделать (found) ->
								@.done(not found?)
								
					снасти.generate_unique_id(название, проверка, @.в 'id')
					
				.сделать (id) ->
					values = { название: название, id: id, создано: new Date() }
					
					if append?
						append(values, environment)
					
					db(options.id).save(values, @._.в 'общение')
					
				.сделать (общение) ->
					environment.сообщения_чего = { _id: общение._id }
					
					options.save(сообщение, environment, @)
				
				.сделать ->
					if options.creation_extra?
						return options.creation_extra(@._.общение._id, пользователь, ввод, @)
					@.done()
					
				.сделать ->
					return вывод.send { id: @.$.id }
					
	result