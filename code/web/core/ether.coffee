соединения = {}
listeners = {}

online = redis.createClient()

api = {}

api.общения = {}

эфир = websocket
	.of('/эфир')
	.on 'connection', (соединение) ->
		fiberize.websocket(соединение)
	
		user = null
		пользователь = null
		
		disconnected = false
		
		соединение.connections = {}
		connections = соединение.connections
		
		disconnect = ->
			disconnected = true
			
			delete соединения[соединение.id]
			delete listeners[соединение.id]
	
			# disconnect communications
			for type, connection of connections
				if not api.общения[type].multiple?
					connection.disconnect()
				else
					for _id, subconnection of connection
						subconnection.disconnect()
			
			if пользователь?
				still_online = false
				for id, connection of соединения
					if connection.пользователь?
						if connection.пользователь._id + '' == пользователь._id
							still_online = true
	
				# don't go offline if has another ether connections
				if not still_online
					online.hdel.bind_await(online)('ether:online', пользователь._id)
					
					for id, listener of listeners
						listener.offline(пользователь)
						
					# пользователь offline
			
			return соединение.disconnect()
			
		соединение.on 'disconnect', ->
			if not disconnected
				disconnect()
		
		соединение.on 'пользователь', (тайный_ключ) ->
			пользователь = пользовательское.опознать.await(тайный_ключ)
		
			if not пользователь?
				throw 'Пользователь не найден: ' + тайный_ключ
					
			соединение.пользователь = { _id: пользователь._id }
			
			соединения[соединение.id] = соединение
						
			user = пользователь
			пользователь = пользовательское.поля(пользователь)

			was_online = online.hget.bind_await(online)('ether:online', пользователь._id)
			
			if not was_online?
				online.hset('ether:online', пользователь._id, JSON.stringify(пользователь))
		
				for id, listener of listeners
					listener.online(пользователь)
					
			#
					
			listener = {}
			
			listener.online = (user) =>
				#api.отправить('пользователи', 'online', Object.выбрать(['_id'], user))
					
			listener.offline = (user) ->
				#api.отправить('пользователи', 'offline', Object.выбрать(['_id'], user))
			
			listener.пользователь = пользователь._id
			listeners[соединение.id] = listener
			
			соединение.on 'уведомления', ->
				уведомления = новости.уведомления(соединение.пользователь)		
				соединение.emit('новости' + ':' + 'уведомления', уведомления)
			
			соединение.emit 'готов'
		
		соединение.on 'присутствие', ->
			activity = Activity[пользователь._id]
			
			if not activity?
				throw 'No activity monitor for user ' + пользователь.имя
			else
				activity.detected()
		
		общение_по_id = (collection, id) ->
			if not id?
				id = collection
				collection = connections
			
			if not id._id?
				return collection[id.type]
			
			if collection[id.type]?
				return collection[id.type][id._id]

		соединение.on 'общение:emit', (data) ->
			общение = общение_по_id(data.id)
			
			if not общение?
				console.log('Communication not found:')
				console.log(id)
				return
				
			общение.trigger(data.message, data.data)

		соединение.on 'общение:disconnect', (id) ->
			общение = общение_по_id(id)
			
			if not общение?
				console.log('Communication not found:')
				console.log(id)
				return
			
			общение.disconnect()
			
			if not id._id?
				delete connections[id.type]
			else
				delete connections[id.type][id._id]
		
		соединение.on 'общение:connect', (data) ->
			id = data.id
			
			общение = api.общения[id.type]
			
			if not общение?
				throw 'communication type not defined: ' + id.type
		
			environment = data.environment
				
			environment.пользователь = user
			
			общение = общение(environment)
			
			это_же_общение = (where) ->
				общение_по_id(where, id)
			
			communication = общение_по_id(id)
			if communication?
				throw 'Already connected'
			
			if not id._id?
				connections[id.type] = общение
			else
				if not connections[id.type]?
					connections[id.type] = {}
					
				connections[id.type][id._id] = общение
			
			общение.broadcast = (message, data) ->
				for unused, connection of соединения
					# кроме самого себя
					if connection.пользователь._id + '' == environment.пользователь._id + ''
						continue
					
					общение = это_же_общение(connection.connections)
				
					if общение?
						общение.emit(message, data)
				
			общение.listeners = {}
			
			общение.on = (message, action) ->
				@listeners[message] = action
				
			общение.trigger = (message, data) ->
				listener = @listeners[message]
				
				if not listener?
					console.log 'ERROR: Listener not found for message ' + message
					return
					
				listener(data)
				
			общение.emit = (message, data) ->
				соединение.emit('общение:emit', { id: id, message: message, data: data })
				
			общение.connect()
			
		соединение.emit 'поехали'
		соединение.emit 'version', Options.Version

api.offline = (пользователь) ->
	for id, listener of listeners
		listener.offline(пользователь)

api.отправить = (group, name, data, options, возврат) ->
	if typeof options == 'function'
		возврат = options
		options = {}
			
	options = options || {}
	возврат = возврат || (() ->)
	
	connections = соединения
	
	if options.кому?
		for id, connection of connections
			if connection.пользователь?
				if connection.пользователь._id + '' == options.кому + ''
					connection.emit(group + ':' + name, data)
				
		return возврат(null, yes)

	if options.кроме?
		for id, connection of connections
			if connection.пользователь?
				if connection.пользователь._id + '' != options.кроме + ''
					connection.emit(group + ':' + name, data)
				
		return возврат(null, yes)
	
	for id, connection of connections
		if connection.пользователь?
			connection.emit(group + ':' + name, data)
			
	return возврат(null, yes)

api.пользователи = () ->
	пользователи = {}
	
	for id, connection of соединения
		пользователи[connection.пользователь._id + ''] = yes
		
	return Object.get_keys(пользователи)
	        
api.отправить_одному_соединению = (group, name, data, options, возврат) ->
	возврат = возврат || (() ->)
	
	connections = соединения
		
	if options.кому?
		user_connections = []
				
		for id, connection of connections
			if connection.пользователь?
				if connection.пользователь._id + '' == options.кому + ''
					connection.emit(group + ':' + name, data)
					return возврат(null, yes)
				
		console.error('No connections for user: ' + options.кому)
		return возврат(null, no)

	else if options.кроме?
		notified_users = []
		
		users_connections = {}
		
		for id, connection of connections
			if connection.пользователь?
				user_id = connection.пользователь._id + ''
				if !notified_users.has(user_id) && user_id != options.кроме + ''
					connection.emit(group + ':' + name, data)
					notified_users[user_id] = yes
				
		return возврат(null, yes)
	
api.в_сети_ли = (_id, возврат) ->
	user = online.hget.bind_await(online)('ether:online', _id + '')
	
	is_online = no
	if user?
		is_online = yes
		
	возврат(null, is_online)
			
api.соединения = соединения

api.общение = (общение, logic) ->
	api.общения[общение] = logic

api.соединение_с = (вид, options) ->
	for id, connection of соединения
		if connection.пользователь?
			if connection.пользователь._id + '' == options.пользователь
				this_type_connection = connection.connections[options.type]
				if this_type_connection?
					if not options._id?
						return this_type_connection
					if this_type_connection[options._id + '']?
						return this_type_connection[options._id + '']

global.эфир = api
