exports.messages = (options) ->
	connected = redis.createClient()
	
	соединения_пользователей = {}
	
	environment = {}

	if not options.messages_collection_id?
		options.messages_collection_id = options.id
			
	messages = (query, parameters, callback) ->
		if not query?
			return db(options.messages_collection_id)
			
		messages_query = {}
		if options.messages_query?
			messages_query = options.messages_query(environment)

		return messages().find(Object.merge_recursive(query, messages_query), parameters).toArray(callback)
		
	connection = websocket
		.of(options.uri)
		.on 'connection', (соединение) ->
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
						
					.сделать ->
						connected.hset(options.id + ':connected', пользователь._id.toString(), JSON.stringify(пользовательское.поля(пользователь)), @)
					
					.сделать ->
						соединение.broadcast.emit('подцепился', пользовательское.поля(пользователь))
				
						# maybe hack attempt
						if not пользователь?
							return
						
						соединение.on 'кто здесь?', ->
							new цепь_websocket(соединение)
								.сделать ->
									connected.hgetall(options.id + ':connected', @)
									
								.сделать (who_is_connected) ->
									who_is_connected_info = []
									for id, json of who_is_connected
										if id + '' != пользователь._id + ''
											who_is_connected_info.push(JSON.parse(json))
											
									соединение.emit 'кто здесь', who_is_connected_info
						
						соединение.on 'получить пропущенные сообщения', (с_какого) ->
							new цепь_websocket(соединение)
								.сделать ->
									messages({ _id: { $gte: messages().id(с_какого._id) } }, {}, @.в 'сообщения')
								.сделать ->
									пользовательское.подставить(@.$.сообщения, 'отправитель', @)
								.сделать ->
									соединение.emit('пропущенные сообщения', @.$.сообщения)
								
						соединение.on 'смотрит', () ->
							соединение.broadcast.emit('смотрит', пользовательское.поля([], пользователь))
								
						соединение.on 'не смотрит', () ->
							соединение.broadcast.emit('не смотрит', пользовательское.поля([], пользователь))
						
						соединение.on 'вызов', (_id) ->
							вызываемый = соединения_пользователей[_id]
							if not вызываемый
								return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
							вызываемый.emit('вызов', пользователь)
						
						соединение.on 'пишет', ->
							соединение.broadcast.emit('пишет', пользовательское.поля([], пользователь))
						
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
									соединение.broadcast.emit('сообщение', данные_сообщения)
						
						disconnected = false
						
						выход = ->
							delete соединения_пользователей[пользователь._id.toString()]
							цепь(websocket)
								.сделать ->
									connected.hdel(options.id + ':connected', пользователь._id, @)
									
								.сделать () ->
									соединение.broadcast.emit('отцепился', пользовательское.поля([], пользователь))
									disconnected = true
									соединение.disconnect()
			
						соединение.on 'выход', () ->
							if not disconnected
								выход()
							
						соединение.on 'disconnect', () ->
							if not disconnected
								выход()
								
						соединение.emit 'пользователь подтверждён'
						
			соединение.on 'environment', (environment_data) ->
				environment.сообщения_чего = environment_data.сообщения_чего
				соединение.emit 'готов'
						
	Max_batch_size = 1000

	sanitize = (html, возврат) ->
		#console.log('возврат')
		возврат(null, html)
		
	http.get options.data_uri, (ввод, вывод, пользователь) ->
		#if options.data_uri.starts_with('/сеть/')
		environment.пользователь = пользователь
		цепь(вывод)
			.сделать ->
				if options.сообщения_чего?
					if not environment.сообщения_чего?
						return options.сообщения_чего(ввод, @)
				return @.done()
				
			.сделать (сообщения_чего) ->
				if сообщения_чего?
					environment.сообщения_чего = сообщения_чего
				начиная_с_какого_выбрать(ввод, environment, @.в 'с_какого_выбрать')
	
			.сделать (с_какого_выбрать) ->
				if not с_какого_выбрать?
					return messages({}, { limit: ввод.настройки.сколько, sort: [['$natural', -1]] }, @.в 'сообщения')
				выбрать(с_какого_выбрать, ввод.настройки.сколько, ввод, @.в 'сообщения')
					
			.сделать ->
				пользовательское.подставить(@.$.сообщения, 'отправитель', @)
				
			.сделать ->
				сообщения = @.$.сообщения
				return @.done() if сообщения.length == 0
				messages({ _id: { $lt: сообщения[сообщения.length - 1]._id }}, { sort: [['$natural', -1]], limit: 1 }, @)
					
			.сделать (ещё_сообщения) ->
				есть_ли_ещё = no
				if ещё_сообщения? && ещё_сообщения.length > 0
					есть_ли_ещё = yes
					
				client_environment =
					пользователь: пользовательское.поля(['_id'], пользователь)
					сообщения_чего: environment.сообщения_чего
					
				вывод.send({ сообщения: @.$.сообщения, 'есть ещё?': есть_ли_ещё, environment: client_environment })
	
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
				messages({ отправитель: id }, { sort: [['$natural', -1]], limit: 1 }, @)
			
			.сделать (сообщения) ->
				сообщение = сообщения[0]
				if сообщение?
					return @.done({ с: сообщение._id, ограничение: Max_batch_size, откуда: 'позже' })
				return @.done()
					
	выбрать = (с_какого, сколько, ввод, возврат) ->
		с = с_какого.с
		ограничение = сколько
		сравнение_id = null
		
		if not с_какого.откуда?
			с_какого.откуда = 'раньше'
		
		if с_какого.ограничение?
			if ограничение > с_какого.ограничение
				ограничение = с_какого.ограничение
			
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
		messages({ _id: id_criteria }, { limit: ограничение, sort: [['$natural', -1]] }, возврат)
	
	connection