exports.messages = (options) ->
	connected = redis.createClient()
			
	new Цепочка()
		.сделать ->
			connected.del(options.id + ':connected', @)
			
		.сделать ->
			if not options.messages_collection_id?
				options.messages_collection_id = options.id

			collection = db(options.messages_collection_id)
									
			these_messages_query = (query, environment) ->
				if not options.messages_query?
					return query
				
				Object.merge_recursive(Object.clone(query), options.messages_query(environment))

			prepare_messages_for_output = (сообщения, environment, возврат) ->
				new Цепочка(возврат)
					.сделать ->
						db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
						
					.сделать (session) ->
						switch options.id
							when  'chat'
								if not session.новости.болталка?
									break
								
								for сообщение in @._.сообщения
									if сообщение._id + '' <= session.новости.болталка
										сообщение.новое = yes
								
							when  'discussions'
								if not session.новости.обсуждения?
									break
									
								discussion = environment.сообщения_чего._id.toString()
								if not session.новости.обсуждения[discussion]?
									break
								
								for сообщение in @._.сообщения
									if session.новости.обсуждения[discussion].has(сообщение._id + '')
										сообщение.новое = yes
							
							when  'talks'
								if not session.новости.беседы?
									break
									
								talk = environment.сообщения_чего._id.toString()
								if not session.новости.беседы[talk]?
									break
								
								for сообщение in @._.сообщения
									if session.новости.беседы[talk].has(сообщение._id + '')
										сообщение.новое = yes
						
						return @.return(@._.сообщения)
		
			соединения = {}
			
			connection = websocket
				.of(options.uri)
				.on 'connection', (соединение) ->
					соединения[соединение.id] = соединение
					эфир.соединения[options.in_ether_id][соединение.id] = соединение
					environment = {}
			
					connected_data_source = ->
						if not environment.сообщения_чего?
							return options.id + ':connected'
						options.id + ':' + environment.сообщения_чего._id + ':connected'
			
					broadcast = (id, content) ->
						if not environment.сообщения_чего?
							return соединение.broadcast.emit(id, content)
							
						connected_clients = соединение.manager.rooms[options.uri + '/' + environment.сообщения_чего._id + '']
						if connected_clients?
							for connection_id in connected_clients
								соединения[connection_id].emit(id, content)
						#websocket.sockets.in(environment.сообщения_чего._id + '').emit()
			
					initialize = null
			
					соединение.on 'пользователь', (тайный_ключ) ->
						пользователь = null
						цепь_websocket(соединение)
							.сделать ->
								пользовательское.опознать(тайный_ключ, @.в 'пользователь')
							
							.сделать (user) ->
								if not user?
									return send ошибка: 'пользователь не найден: ' + тайный_ключ
								пользователь = user
								environment.пользователь = пользователь
								соединение.пользователь = { _id: пользователь._id }
								
								# maybe hack attempt
								if not пользователь?
									return
								
								соединение.on 'кто здесь?', ->
									new цепь_websocket(соединение)
										.сделать ->
											connected.hgetall(connected_data_source(), @)
											
										.сделать (who_is_connected) ->
											who_is_connected_info = []
											for id, json of who_is_connected
												if id + '' != пользователь._id + ''
													who_is_connected_info.push(JSON.parse(json))
													
											соединение.emit 'кто здесь', who_is_connected_info
								
								соединение.on 'получить пропущенные сообщения', (с_какого) ->
									new цепь_websocket(соединение)
										.сделать ->
											collection.find(these_messages_query({ _id: { $gte: collection.id(с_какого._id) } }, environment), { sort: [['_id', 1]] }).toArray(@.в 'сообщения')
										.сделать ->
											пользовательское.подставить(@.$.сообщения, 'отправитель', @)
										.сделать ->
											соединение.emit('пропущенные сообщения', @.$.сообщения)
										
								соединение.on 'смотрит', () ->
									broadcast('смотрит', пользовательское.поля(пользователь))
										
								соединение.on 'не смотрит', () ->
									broadcast('не смотрит', пользовательское.поля(пользователь))
								
								соединение.on 'вызов', (_id) ->
									цепь_websocket(соединение)
										.сделать ->
											if not эфир.отправить('общее', 'вызов', пользовательское.поля(пользователь), { кому: _id })
												return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
								
								соединение.on 'пишет', ->
									broadcast('пишет', пользовательское.поля([], пользователь))
								
								соединение.on 'сообщение', (сообщение) ->
									цепь_websocket(соединение)
										#.сделать ->
										#	sanitize(сообщение, @)
											
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
											данные_сообщения =
												_id: @._.сообщение._id.toString()
												отправитель: пользовательское.поля(пользователь)
												сообщение: @._.сообщение.сообщение
												когда: @._.сообщение.когда
											
											соединение.emit('сообщение', данные_сообщения)
											broadcast('сообщение', данные_сообщения)
								
								disconnected = false
								
								выход = ->
									delete соединения[соединение.id]
									delete эфир.соединения[options.in_ether_id][соединение.id]
								
									цепь_websocket(соединение)
										.сделать ->
											connected.hdel(connected_data_source(), пользователь._id, @)
											
										.сделать ->
											broadcast('отцепился', пользовательское.поля([], пользователь))
											disconnected = true
											соединение.disconnect()
					
								соединение.on 'выход', () ->
									if not disconnected
										выход()
									
								соединение.on 'disconnect', () ->
									if not disconnected
										выход()
											
								соединение.on 'environment', (environment_data) ->
									if environment_data.сообщения_чего?
										соединение.join(environment_data.сообщения_чего._id + '')
										if not соединение.custom_data?
											соединение.custom_data = {}
										соединение.custom_data._id = environment_data.сообщения_чего._id + ''
										environment.сообщения_чего = options.сообщения_чего_from_string(environment_data.сообщения_чего)
								
									цепь_websocket(соединение)
										.сделать ->
											connected.hset(connected_data_source(), пользователь._id.toString(), JSON.stringify(пользовательское.поля(пользователь)), @)
										
										.сделать ->
											broadcast('подцепился', пользовательское.поля(пользователь))
											соединение.emit 'готов'
											
								соединение.on 'прочитано', (_id) ->
									цепь_websocket(соединение)
										.сделать ->
											if options.message_read?
												options.message_read(collection.id(_id), environment, @)
												
											сообщения_чего = null
											if environment.сообщения_чего?
												сообщения_чего = environment.сообщения_чего._id.toString()
												
											эфир.отправить('новости', 'прочитано', { что: options.in_ether_id, сообщения_чего: сообщения_чего, _id: _id.toString() })

								соединение.emit 'пользователь подтверждён'
												
			http.get options.data_uri, (ввод, вывод, пользователь) ->
				#if options.data_uri.starts_with('/сеть/')
				environment = {}
				environment.пользователь = пользователь
					
				loading_options =
					collection: options.messages_collection_id
							
				цепь(вывод)
					.сделать ->
						if options.сообщения_чего?
							return new Цепочка(@)
								.сделать ->
									options.сообщения_чего(ввод, @)
								.сделать (сообщения_чего) ->
									environment.сообщения_чего = сообщения_чего
									@.done()
						@.done()
						
					.сделать ->
						if not ввод.настройки.после? && options.latest_read_message?
							return new Цепочка(@)
								.сделать ->
									options.latest_read_message(environment, @)
								.сделать (последнее_прочитанное_сообщение) ->
									loading_options.с = последнее_прочитанное_сообщение
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
						options.update(data._id, data.content, @)
					else
						_id = db('messages').id(data._id)
						db('messages').update({ _id: _id }, { $set: { сообщение: data.content } }, @)
					
					#new Цепочка(@)
						#.сделать ->		
						#	db('messages').update({ _id: _id }, { $set: { сообщение: data.content } }, @)
					
						#.сделать ->		
						#	db('messages').findOne({ _id: _id }, @)
							
						#.сделать (message) ->	
						#	options.notify(message._id, { правка: yes, сообщения_чего: { _id: message.общение }, пользователь: пользователь }, @)
					
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
					set_id = 'новости.' + options.in_session_id + '.' + _id
					db('people_sessions').update({ пользователь: environment.пользователь._id }, { $unset: set_id }, @)
					
				.сделать ->
					новости.уведомления(пользователь, @)
					
				.сделать (уведомления) ->
					эфир.отправить('новости', 'уведомления', уведомления)
					вывод.send {}
		
	result.enable_renaming = (url) ->
		http.post '/сеть/' + url + '/переназвать', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			название = ввод.body.название
			
			цепь(вывод)
				.сделать ->
					db(options.id).update({ _id: db(options.id).id(_id) }, { $set: { название: название } }, @)
					
				.сделать ->
					эфир.отправить(options.in_ether_id, 'переназвано', { _id: _id, как: название })
					вывод.send {}
					
	result