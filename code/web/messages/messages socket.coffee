global.prepare_messages_socket = (options) ->
	connected = redis.createClient()
			
	цепь()
		.сделать ->
			connected.del(options.id + ':connected', @)
			
		.сделать ->
			collection = db(options.messages_collection)
									
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
										collection.find(options.these_messages_query({ _id: { $gte: collection.id(с_какого._id) } }, environment), { sort: [['_id', 1]] }).toArray(@.в 'сообщения')
									
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
								synchronous () ->
									сообщение = options.save._()(сообщение, environment)
									
									options.message_read._()(сообщение._id, environment)
									
									if options.subscribe?
										options.subscribe._()(environment)
									
									options.notify(сообщение._id, environment)
										
									предыдущие_сообщения = db(options.messages_collection)._.find(options.these_messages_query({ _id: { $lt: сообщение._id } }, environment), { limit: 1, sort: [['_id', -1]] })
										
									if предыдущие_сообщения.пусто()
										throw 'Previous message not found'
											
									данные_сообщения =
										_id: сообщение._id.toString()
										отправитель: пользовательское.поля(пользователь)
										сообщение: сообщение.сообщение
										когда: сообщение.когда
										предыдущее: предыдущие_сообщения[0]._id.toString()
									
									соединение.emit('сообщение', данные_сообщения)
									broadcast('сообщение', данные_сообщения)
										
								return
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
										db(options.messages_collection).find(options.these_messages_query({ _id: { $lt: @._.сообщение._id } }, environment), { limit: 1, sort: [['_id', -1]] }).toArray(@)
										
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