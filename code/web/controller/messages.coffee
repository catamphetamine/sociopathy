exports.messages = (options) ->
	connected = redis.createClient()
			
	new Цепочка()
		.сделать ->
			connected.del(options.id + ':connected', @)
			
		.сделать ->
			if not options.messages_collection_id?
				options.messages_collection_id = options.id
					
			messages = (query, parameters, environment, callback) ->
				if not query?
					return db(options.messages_collection_id)
					
				collection = messages()
					
				messages_query = {}
				if options.messages_query?
					messages_query = options.messages_query(collection, environment)
		
				query = Object.merge_recursive(query, messages_query)
				
				if parameters.count_query?
					return collection.count(query, callback)
				
				new Цепочка(callback)
					.сделать ->
						collection.find(query, parameters).toArray(@._.в 'сообщения')
						
					.сделать (сообщения) ->
						db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
						
					.сделать (session) ->
						if not session.новое?
							return @.return(@._.сообщения)
							
						switch options.id
							when  'chat'
								if not session.новости.болталка?
									break
								
								for сообщение in @._.сообщения
									if сообщение._id + '' < session.новости.болталка
										сообщение.новое = yes
								
							when  'discussions'
								if not session.новости.обсуждения?
									break
								
								for сообщение in @._.сообщения
									if session.новости.обсуждения.has(сообщение._id + '')
										сообщение.новое = yes
							
							when  'talks'
								if not session.новости.беседы?
									break
								
								for сообщение in @._.сообщения
									if session.новости.беседы.has(сообщение._id + '')
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
											messages({ _id: { $gte: messages().id(с_какого._id) } }, {}, environment, @.в 'сообщения')
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
											if not эфир.отправить('общее', 'вызов', пользовательское.поля(пользователь), { пользователь: _id })
												return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
								
								соединение.on 'пишет', ->
									broadcast('пишет', пользовательское.поля([], пользователь))
								
								соединение.on 'сообщение', (сообщение) ->
									цепь_websocket(соединение)
										.сделать ->
											sanitize(сообщение, @)
											
										.сделать (сообщение) ->
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
									#console.log('прочитано')
									#console.log(_id)
									#console.log(environment.пользователь.имя)
									цепь_websocket(соединение)
										.сделать ->
											if options.message_read?
												options.message_read(messages().id(_id), environment, @)
						
								соединение.emit 'пользователь подтверждён'
								
			Max_batch_size = 30
		
			sanitize = (html, возврат) ->
				#console.log('возврат')
				возврат(null, html)
				
			http.get options.data_uri, (ввод, вывод, пользователь) ->
				#if options.data_uri.starts_with('/сеть/')
				environment = {}
				environment.пользователь = пользователь
					
				цепь(вывод)
					.сделать ->
						if options.сообщения_чего?
							return options.сообщения_чего(ввод, @)
						@.done()
						
					.сделать (сообщения_чего) ->
						if сообщения_чего?
							environment.сообщения_чего = сообщения_чего
						@.done()
							
					.сделать ->
						if options.latest_read_message?
							return options.latest_read_message(environment, @.в 'последнее_прочитанное_сообщение')
						@.done()
		
					.сделать ->
						начиная_с_какого_выбрать(@.$.последнее_прочитанное_сообщение, ввод, environment, @.в 'с_какого_выбрать')
			
					.сделать (с_какого_выбрать) ->
						if not с_какого_выбрать?
							return messages({}, { limit: ввод.настройки.сколько, sort: [['$natural', -1]] }, environment, @.в 'сообщения')
						выбрать(с_какого_выбрать, ввод.настройки.сколько, ввод, environment, @.в 'сообщения')
							
					.сделать ->
						пользовательское.подставить(@.$.сообщения, 'отправитель', @)
		
					.сделать ->
						if options.extra_get?
							return options.extra_get(@.$, environment, @)
						@.done()
						
					.сделать ->
						сообщения = @.$.сообщения
						return @.done() if сообщения.length == 0
						messages({ _id: { $lt: сообщения[сообщения.length - 1]._id }}, { limit: 1 }, environment, @)
							
					.сделать (ещё_сообщения) ->
						есть_ли_ещё = no
						if ещё_сообщения? && ещё_сообщения.length > 0
							есть_ли_ещё = yes
							
						@.$.environment =
							пользователь: пользовательское.поля(['_id'], пользователь)
							сообщения_чего: environment.сообщения_чего
							
						@.$['есть ещё?'] = есть_ли_ещё
						
						for сообщение in @.$.сообщения
							сообщение._id = сообщение._id.toString()
							
						вывод.send(@.$)
			
			начиная_с_какого_выбрать = (последнее_прочитанное_сообщение, ввод, environment, возврат) ->
				if ввод.настройки.с?
					return возврат.done({ с: db(options.id).id(ввод.настройки.с), прихватить_границу: no, откуда: 'раньше' })
			
				new Цепочка(возврат)
					.сделать ->
						if последнее_прочитанное_сообщение?
							return @.return({ с: последнее_прочитанное_сообщение, ограничение: Max_batch_size, откуда: 'позже' })
						@.done()
		
					.сделать ->
						id = environment.пользователь._id
						messages({ отправитель: id }, { sort: [['$natural', -1]], limit: 1 }, environment, @)
					
					.сделать (сообщения) ->
						сообщение = сообщения[0]
						if сообщение?
							return @.done({ с: сообщение._id, ограничение: Max_batch_size, откуда: 'позже' })
						@.done()
							
			выбрать = (с_какого, сколько, ввод, environment, возврат) ->
				с = с_какого.с
				#ограничение = сколько
				сравнение_id = null
				
				if not с_какого.откуда?
					с_какого.откуда = 'раньше'
				
				#if с_какого.ограничение?
				#	if ограничение > с_какого.ограничение
				#		ограничение = с_какого.ограничение
					
				if с_какого.откуда == 'раньше'
					сравнение_id = '$lte'
				else if с_какого.откуда == 'позже'
					сравнение_id = '$gte'
			
				if с_какого.прихватить_границу == no
					if сравнение_id == '$lte'
						сравнение_id = '$lt'
					else if сравнение_id == '$gte'
						сравнение_id = '$gt'
				
				id_criteria = {}
				id_criteria[сравнение_id] = с
				
				parameters = { sort: [['$natural', -1]] }
				if сколько?
					parameters.limit = сколько
		
				new Цепочка(возврат)
					.сделать ->
						messages({ _id: id_criteria }, Object.merge_recursive({ count_query: yes }, parameters), environment, @)
						
					.сделать (сколько_есть) ->
						if с_какого.ограничение?
							if сколько_есть > с_какого.ограничение
								new Цепочка(возврат)
									.сделать ->
										messages({}, { limit: 1, sort: [['$natural', -1]] }, environment, @)
										
									.сделать (message) ->
										if message.пусто()
											return @.done([])
										последнее_сообщение = message[0]
										return выбрать(последнее_сообщение, с_какого.ограничение, ввод, environment, возврат)
										
						@.done()
					
					.сделать ->
						messages({ _id: id_criteria }, parameters, environment, @)
			
			#return @.return(connection)