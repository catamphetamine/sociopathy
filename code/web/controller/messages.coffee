exports.messages = (options) ->
	connected = redis.createClient()
	
	соединения_пользователей = {}

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
			
		return collection.find(query, parameters).toArray(callback)
		
	connection = websocket
		.of(options.uri)
		.on 'connection', (соединение) ->
			environment = {}
	
			connected_data_source = ->
				if not environment.сообщения_чего?
					return options.id + ':connected'
				options.id + ':' + environment.сообщения_чего._id + ':connected'
	
			broadcast = ->
				if not environment.сообщения_чего?
					return соединение.broadcast
				websocket.sockets.in(environment.сообщения_чего._id)
	
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
						соединения_пользователей[пользователь._id.toString()] = соединение
						@()
						
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
							broadcast().emit('смотрит', пользовательское.поля([], пользователь))
								
						соединение.on 'не смотрит', () ->
							broadcast().emit('не смотрит', пользовательское.поля([], пользователь))
						
						соединение.on 'вызов', (_id) ->
							вызываемый = соединения_пользователей[_id]
							if not вызываемый
								return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
							вызываемый.emit('вызов', пользователь)
						
						соединение.on 'пишет', ->
							broadcast().emit('пишет', пользовательское.поля([], пользователь))
						
						соединение.on 'сообщение', (сообщение) ->
							цепь_websocket(соединение)
								.сделать ->
									sanitize(сообщение, @)
									
								.сделать (сообщение) ->
									options.save(сообщение, environment, @)
									
								.сделать (сообщение) ->
									данные_сообщения =
										_id: сообщение._id.toString()
										отправитель: пользовательское.поля(пользователь)
										сообщение: сообщение.сообщение
										когда: сообщение.когда
									
									соединение.emit('сообщение', данные_сообщения)
									broadcast().emit('сообщение', данные_сообщения)
						
						disconnected = false
						
						выход = ->
							delete соединения_пользователей[пользователь._id.toString()]
							цепь_websocket(соединение)
								.сделать ->
									connected.hdel(connected_data_source(), пользователь._id, @)
									
								.сделать () ->
									broadcast().emit('отцепился', пользовательское.поля([], пользователь))
									disconnected = true
									соединение.disconnect()
			
						соединение.on 'выход', () ->
							if not disconnected
								выход()
							
						соединение.on 'disconnect', () ->
							if not disconnected
								выход()
									
						соединение.on 'environment', (environment_data) ->
							if environment.сообщения_чего?
								соединение.join(environment.сообщения_чего._id)
							
							environment.сообщения_чего = environment_data.сообщения_чего
							
							цепь_websocket(соединение)
								.сделать ->
									connected.hset(connected_data_source(), пользователь._id.toString(), JSON.stringify(пользовательское.поля(пользователь)), @)
								
								.сделать ->
									broadcast().emit('подцепился', пользовательское.поля(пользователь))
									соединение.emit 'готов'
									
						соединение.on 'прочитано', (_id) ->
							db('people_sessions').update({ пользователь: environment.пользователь._id }, { $set: { последнее_прочитанное_сообщение_в_болталке: _id } }, @)
				
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
				return @.done()
				
			.сделать (сообщения_чего) ->
				if сообщения_чего?
					environment.сообщения_чего = сообщения_чего
				начиная_с_какого_выбрать(ввод, environment, @.в 'с_какого_выбрать')
	
			.сделать (с_какого_выбрать) ->
				if not с_какого_выбрать?
					return messages({}, { limit: ввод.настройки.сколько, sort: [['$natural', -1]] }, environment, @.в 'сообщения')
				выбрать(с_какого_выбрать, ввод.настройки.сколько, ввод, environment, @.в 'сообщения')
					
			.сделать ->
				пользовательское.подставить(@.$.сообщения, 'отправитель', @)
				
			.сделать ->
				db('people_sessions').findOne({ пользователь: пользователь._id }, @)
				
			.сделать (session) ->
				if session.последнее_прочитанное_сообщение_в_болталке?
					@.$.последнее_прочитанное_сообщение = session.последнее_прочитанное_сообщение_в_болталке
				@.done()

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
	
	начиная_с_какого_выбрать = (ввод, environment, возврат) ->
		if ввод.настройки.с?
			return возврат.done({ с: db(options.id).id(ввод.настройки.с), прихватить_границу: no, откуда: 'раньше' })
	
		new Цепочка(возврат)
			.сделать ->
				if options.с_какого_выбрать?
					return options.с_какого_выбрать(ввод, environment, @)
				@.done()
			
			.сделать (с_какого_выбрать) ->
				if с_какого_выбрать?
					return возврат({ с: db(options.id).id(с_какого_выбрать), ограничение: Max_batch_size, откуда: 'позже' })
				@.done()

			.сделать ->
				id = environment.пользователь._id
				messages({ отправитель: id }, { sort: [['$natural', -1]], limit: 1 }, environment, @)
			
			.сделать (сообщения) ->
				сообщение = сообщения[0]
				if сообщение?
					return @.done({ с: сообщение._id, ограничение: Max_batch_size, откуда: 'позже' })
				return @.done()
					
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
	
	connection