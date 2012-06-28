options =
	id: 'chat'
	uri: '/болталка'
	save: (сообщение, @) ->
		new Цепочка(@)
			.сделать (сообщение) ->
				хранилище.collection('chat').save { отправитель: пользователь._id, сообщение: сообщение, когда: new Date() }, @.в 'сообщение'
				
			.сделать (сообщение) ->
				пользовательское.set_session_data(тайный_ключ, 'последнее сообщение в болталке', сообщение._id, @)
		
exports.messages = (options) ->
	online = redis.createClient()
	
	соединения_пользователей = {}
	
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
						соединения_пользователей[пользователь._id.toString()] = соединение
						@()
						
					.сделать ->
						connected.hset(options.id + ':connected', пользователь._id.toString(), JSON.stringify(пользователь), @)
					
					.сделать ->
						connected.hgetall(options.id + ':connected', @)
						
					.сделать (who_is_connected) ->
						who_is_connected_info = []
						for id, json of who_is_connected
							if id + '' != пользователь._id + ''
								who_is_connected_info.push(JSON.parse(json))
								
						соединение.emit 'кто здесь', who_is_connected_info
						соединение.broadcast.emit('подцепился', пользовательское.поля(пользователь))
						соединение.emit 'готов'
				
						# maybe hack attempt
						if not пользователь?
							return
						
						соединение.on 'смотрит', () ->
							соединение.broadcast.emit('смотрит', Object.выбрать(['_id'], пользователь))
								
						соединение.on 'не смотрит', () ->
							соединение.broadcast.emit('не смотрит', Object.выбрать(['_id'], пользователь))
						
						соединение.on 'вызов', (_id) ->
							вызываемый = соединения_пользователей[_id]
							if not вызываемый
								return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
							вызываемый.emit('вызов', пользователь)
						
						соединение.on 'пишет', ->
							соединение.broadcast.emit('пишет', пользователь)
						
						соединение.on 'сообщение', (сообщение) ->
							цепь_websocket(соединение)
								.сделать ->
									sanitize(сообщение, @)
									
								.сделать (сообщение) ->
									options.save(сообщение, @)
									
								.сделать ->
									сообщение = @.$.сообщение
									данные_сообщения =
										отправитель: пользовательское.поля(пользователь)
										сообщение: сообщение.сообщение
										когда: сообщение.когда
									
									соединение.emit('сообщение', данные_сообщения)
						
						disconnected = false
						
						выход = ->
							delete соединения_пользователей[пользователь._id.toString()]
							цепь(websocket)
								.сделать ->
									connected.hdel(options.id + ':connected', пользователь._id, @)
									
								.сделать () ->
									соединение.broadcast.emit('отцепился', Object.выбрать(['_id'], пользователь))
									disconnected = true
									соединение.disconnect()
			
						соединение.on 'выход', () ->
							if not disconnected
								выход()
							
						соединение.on 'disconnect', () ->
							if not disconnected
								выход()
								
	connection