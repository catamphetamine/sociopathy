соединения = {}
listeners = {}

online = redis.createClient()

эфир = websocket
	.of('/эфир')
	.on 'connection', (соединение) ->
		соединение.on 'пользователь', (тайный_ключ) ->
			пользователь = null
			цепь_websocket(соединение)
				.сделать ->
					пользовательское.опознать(тайный_ключ, @.в 'пользователь')
				
				.сделать (user) ->
					if not user?
						return send ошибка: 'пользователь не найден: ' + тайный_ключ
						
					пользователь = пользовательское.поля(user)
					
					соединения[соединение.id] = соединение
						
					@.done()
					
				.сделать ->
					online.hset('ether:online', пользователь._id.toString(), JSON.stringify(пользователь), @)
				
				.сделать ->
					online.hgetall('ether:online', @)
					
				.сделать (who_is_online) ->
					who_is_online_info = []
					for id, json of who_is_online
						if id + '' != пользователь._id + ''
							who_is_online_info.push(JSON.parse(json))
							
					соединение.emit('who is online', who_is_online_info)
					#соединение.broadcast.emit('online', Object.выбрать(['_id'], пользователь))
					соединение.emit 'готов'
					
					for id, listener of listeners
						listener.online(пользователь)
					
					listener = {}
					
					_id = пользователь._id.toString()
					
					listener.online = (user) =>
						if _id != user._id.toString()
							соединение.emit('online', Object.выбрать(['_id'], user))
							
					listener.offline = (user) ->
						if _id != user._id.toString()
							соединение.emit('offline', Object.выбрать(['_id'], user))
					
					listener.пользователь = _id
					listeners[соединение.id] = listener
					
					disconnected = false
					
					выход = ->
						delete соединения[соединение.id]
						delete listeners[соединение.id]
				
						still_online = false
						for id, listener of listeners
							if listener.пользователь == _id
								still_online = true
								
						finish = () ->
							disconnected = true
							return соединение.disconnect()
								
						return finish() if still_online
							
						цепь(websocket)
							.сделать ->
									online.hdel('ether:online', пользователь._id, @)
								
							.сделать () ->
								for id, listener of listeners
									listener.offline(пользователь)
								
								finish()
		
					соединение.on 'выход', () ->
						if not disconnected
							выход()
						
					соединение.on 'disconnect', () ->
						if not disconnected
							выход()
							
exports.offline = (пользователь) ->
	for id, listener of listeners
		listener.offline(пользователь)