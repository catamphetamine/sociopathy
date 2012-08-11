соединения =
	эфир: {}
	болталка: {}
	беседы: {}
	обсуждения: {}
	новости: {}
	
listeners = {}

online = redis.createClient()

эфир = websocket
	.of('/эфир')
	.on 'connection', (соединение) ->
		соединения.эфир[соединение.id] = соединение
		
		соединение.вид = 'эфир'
		
		соединение.on 'пользователь', (тайный_ключ) ->
			пользователь = null
			цепь_websocket(соединение)
				.сделать ->
					пользовательское.опознать(тайный_ключ, @.в 'пользователь')
				
				.сделать (user) ->
					if not user?
						return send ошибка: 'пользователь не найден: ' + тайный_ключ
						
					пользователь = пользовательское.поля(user)
					
					соединение.пользователь = { _id: пользователь._id }
						
					@.done()
			
				.сделать ->
					online.hgetall('ether:online', @)
					
				.сделать (who_is_online) ->
					who_is_online_info = []
					for id, json of who_is_online
						if id + '' != пользователь._id + ''
							who_is_online_info.push(JSON.parse(json))
							
					соединение.emit('кто здесь', who_is_online_info)
					@.done()
					
				.сделать ->
					online.hget('ether:online', пользователь._id.toString(), @)
					
				.сделать (was_online) ->
					if not was_online?
						online.hset('ether:online', пользователь._id.toString(), JSON.stringify(пользователь))
				
						for id, listener of listeners
							listener.online(пользователь)
							
					@.done()
					
				.сделать ->
					listener = {}
					
					_id = пользователь._id.toString()
					
					listener.online = (user) =>
						#if _id != user._id.toString()
						соединение.emit('online', Object.выбрать(['_id'], user))
							
					listener.offline = (user) ->
						#if _id != user._id.toString()
						соединение.emit('offline', Object.выбрать(['_id'], user))
					
					listener.пользователь = _id
					listeners[соединение.id] = listener
					
					disconnected = false
					
					выход = ->
						delete соединения.эфир[соединение.id]
						delete listeners[соединение.id]
				
						still_online = false
						for id, listener of listeners
							if listener.пользователь == _id
								still_online = true
								
						finish = () ->
							disconnected = true
							return соединение.disconnect()
								
						return finish() if still_online
							
						цепь_websocket(соединение)
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
							
					соединение.emit('online', Object.выбрать(['_id'], пользователь))
					соединение.emit 'готов'
							
exports.offline = (пользователь) ->
	for id, listener of listeners
		listener.offline(пользователь)

карта_соединений_по_виду_сообщения = (group, name) ->
	if group? && name?
		if group == 'новости' && name == 'новости'
			return соединения.новости
			
		if group == 'новости' && name == 'беседы'
			return соединения.беседы
			
		if group == 'новости' && name == 'обсуждения'
			return соединения.обсуждения
			
		if group == 'новости' && name == 'болталка'
			return соединения.болталка
			
	return соединения.эфир

exports.отправить = (group, name, data, options, возврат) ->
	возврат = возврат || (() ->)
	
	new Цепочка(возврат)
		.сделать ->
			connections = соединения.эфир
			
			if options.пользователь?
				for id, connection of connections
					if connection.пользователь?
						if connection.пользователь._id + '' == options.пользователь + ''
							connection.emit(group + ':' + name, data)
						
				return @.done(yes)
		
			if options.кроме?
				for id, connection of connections
					if connection.пользователь?
						if connection.пользователь._id + '' != options.кроме + ''
							connection.emit(group + ':' + name, data)
						
				return @.done(yes)
    
exports.соединение_с = (вид, options) ->
	if Object.пусто(соединения[вид])
		return false
	
	for id, connection of соединения[вид]
		if connection.пользователь?
			if connection.пользователь._id + '' == options.пользователь
				if connection.custom_data?
					if connection.custom_data._id == options._id + ''
						return connection
		
	return false
    
exports.пользователи = () ->
	пользователи = {}
	
	for id, connection of соединения.эфир
		пользователи[connection.пользователь._id + ''] = yes
		
	return Object.get_keys(пользователи)
	        
exports.отправить_одному_соединению = (group, name, data, options, возврат) ->
	возврат = возврат || (() ->)
	
	new Цепочка(возврат)
		.сделать ->
			connections = соединения.эфир
				
			if options.пользователь?
				user_connections = []
						
				for id, connection of connections
					console.log('!!!!!!!!!!!!!!!!!!!!!!!!!')
					console.log(connection.пользователь)
					console.log('!!!!!!!!!!!!!!!!!!!!!!!!! _id')
					console.log(options.пользователь + '')
					if connection.пользователь?
						if connection.пользователь._id + '' == options.пользователь + ''
							connection.emit(group + ':' + name, data)
							return @.done(yes)
						
				console.error('No connections for user: ' + options.пользователь)
				return @.done(no)
		
			else if options.кроме?
				notificated_users = []
				
				users_connections = {}
				
				for id, connection of connections
					if connection.пользователь?
						user_id = connection.пользователь._id + ''
						if !notificated_users.has(user_id) && user_id != options.кроме + ''
							connection.emit(group + ':' + name, data)
							notificated_users[user_id] = yes
						
				return @.done(yes)
            
exports.в_сети_ли = (_id, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			online.hget('ether:online', _id + '', @)
			
		.сделать (user) ->
			is_online = no
			if user?
				is_online = yes
				
			return @.return(is_online)
			
exports.соединения = соединения