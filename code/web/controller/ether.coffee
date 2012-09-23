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
		соединение.вид = 'эфир'
	
		пользователь = null
		
		disconnected = false
		
		выход = ->
			delete соединения.эфир[соединение.id]
			delete listeners[соединение.id]
	
			still_online = false
			for id, listener of listeners
				if listener.пользователь == id
					still_online = true
					
			finish_disconnection = () ->
				disconnected = true
				return соединение.disconnect()
					
			# don't go offline if has another ether connections
			return finish_disconnection() if still_online
				
			if пользователь?
				цепь(соединение)
					.сделать ->
						online.hdel('ether:online', пользователь._id, @)
						
					.сделать () ->
						for id, listener of listeners
							listener.offline(пользователь)
						
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
						
					пользователь = пользовательское.поля(user)
					
					соединение.пользователь = { _id: user._id }
					соединения.эфир[соединение.id] = соединение
		
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
					
					#соединение.emit('online', Object.выбрать(['_id'], пользователь))
					
					соединение.on 'уведомления', () ->
						цепь(соединение)
							.сделать ->
								новости.уведомления(соединение.пользователь, @)
								
							.сделать (уведомления) ->
								соединение.emit('новости' + ':' + 'уведомления', уведомления)
							
					соединение.emit 'готов'
					
		соединение.emit 'поехали'
							
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
	if typeof options == 'function'
		возврат = options
		options = {}
			
	options = options || {}
	возврат = возврат || (() ->)
	
	цепь(возврат)
		.сделать ->
			connections = соединения.эфир
			
			if options.кому?
				for id, connection of connections
					if connection.пользователь?
						if connection.пользователь._id + '' == options.кому + ''
							connection.emit(group + ':' + name, data)
						
				return @.done(yes)
		
			if options.кроме?
				for id, connection of connections
					if connection.пользователь?
						if connection.пользователь._id + '' != options.кроме + ''
							connection.emit(group + ':' + name, data)
						
				return @.done(yes)
			
			for id, connection of connections
				if connection.пользователь?
					connection.emit(group + ':' + name, data)
					
			return @.done(yes)
    
exports.соединение_с = (вид, options) ->
	if Object.пусто(соединения[вид])
		return false
	
	for id, connection of соединения[вид]
		if connection.пользователь?
			if connection.пользователь._id + '' == options.пользователь
				if not options._id?
					return connection
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
	
	цепь(возврат)
		.сделать ->
			connections = соединения.эфир
				
			if options.кому?
				user_connections = []
						
				for id, connection of connections
					if connection.пользователь?
						if connection.пользователь._id + '' == options.кому + ''
							connection.emit(group + ':' + name, data)
							return @.done(yes)
						
				console.error('No connections for user: ' + options.кому)
				return @.done(no)
		
			else if options.кроме?
				notified_users = []
				
				users_connections = {}
				
				for id, connection of connections
					if connection.пользователь?
						user_id = connection.пользователь._id + ''
						if !notified_users.has(user_id) && user_id != options.кроме + ''
							connection.emit(group + ':' + name, data)
							notified_users[user_id] = yes
						
				return @.done(yes)
            
exports.в_сети_ли = (_id, возврат) ->
	цепь(возврат)
		.сделать ->
			online.hget('ether:online', _id + '', @)
			
		.сделать (user) ->
			is_online = no
			if user?
				is_online = yes
				
			return @.return(is_online)
			
exports.соединения = соединения