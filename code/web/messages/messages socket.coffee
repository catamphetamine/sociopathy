global.prepare_messages_socket = (options) ->
	fiber ->
		connected = redis.createClient()
		
		connected.del.bind_await(connected)(options.id + ':connected')
	
		collection = db(options.messages_collection)
									
		соединения = {}
		
		connection = websocket
			.of(options.uri)
			.on 'connection', (соединение) ->
				fiberize.websocket(соединение)
				
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
		
				disconnected = false
				пользователь = null
				
				выход = ->
					delete соединения[соединение.id]
					delete эфир.соединения[options.общение][соединение.id]
				
					finish_disconnection = ->
						disconnected = true
						соединение.disconnect()
				
					if пользователь?
						connected.hdel.bind_await(connected)(connected_data_source(), пользователь._id)
						broadcast('отцепился', пользовательское.поля([], пользователь))
						
					finish_disconnection()
						
				соединение.on 'выход', () ->
					if not disconnected
						выход()
					
				соединение.on 'disconnect', () ->
					if not disconnected
						выход()
				
				соединение.on 'пользователь', (тайный_ключ) ->
					пользователь = пользовательское.опознать.await(тайный_ключ)
						
					if not пользователь?
						return send(ошибка: 'Пользователь не найден: ' + тайный_ключ)
								
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
					finish = ->
						соединение.on 'кто здесь?', ->
							who_is_connected = connected.hgetall.bind_await(connected)(connected_data_source())
							
							who_is_connected_info = []
							for id, json of who_is_connected
								if id + '' != пользователь._id + ''
									who_is_connected_info.add(JSON.parse(json))
									
							соединение.emit 'кто здесь', who_is_connected_info
						
						соединение.on 'получить пропущенные сообщения', (с_какого) ->
							Max_lost_messages = 100
							
							query = options.these_messages_query({ _id: { $gte: collection.id(с_какого._id) } }, environment)
							
							if collection._.count(query) > Max_lost_messages
								throw 'Слишком много сообщений пропущено'
							 
							сообщения = collection._.find(query, { sort: [['_id', 1]] })
						
							пользовательское.подставить.await(сообщения, 'отправитель')
							
							соединение.emit('пропущенные сообщения', сообщения)
								
						соединение.on 'смотрит', () ->
							broadcast('смотрит', пользовательское.поля(пользователь))
								
						соединение.on 'не смотрит', () ->
							broadcast('не смотрит', пользовательское.поля(пользователь))
						
						соединение.on 'вызов', (_id) ->
							if not эфир.отправить('общее', 'вызов', пользовательское.поля(пользователь), { кому: _id })
								соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
						
						соединение.on 'пишет', ->
							broadcast('пишет', пользовательское.поля([], пользователь))
						
						соединение.on 'сообщение', (сообщение) ->
							сообщение = options.save.await(сообщение, environment)
							
							options.message_read.await(сообщение._id, environment)
							
							if options.subscribe?
								options.subscribe.await(environment)
							
							options.notify.await(сообщение, environment)
								
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
																				
						соединение.on 'прочитано', (_id) ->
							options.message_read.await(collection.id(_id), environment)
								
							сообщения_чего = null
							if environment.сообщения_чего?
								сообщения_чего = environment.сообщения_чего._id.toString()

						connected.hset.bind_await(connected)(connected_data_source(), пользователь._id.toString(), JSON.stringify(пользовательское.поля(пользователь)))
							
						broadcast('подцепился', пользовательское.поля(пользователь))
						соединение.emit 'готов'
							
					if options.authorize?
						options.authorize.await(environment)
					
					finish()
						
				соединение.emit 'поехали'