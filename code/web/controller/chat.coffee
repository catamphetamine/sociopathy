#sanitize = require('validator').sanitize

redis = require 'redis'

# redis clients
#store = redis.createClient()
#publisher = redis.createClient()
#subscriber = redis.createClient()
online = redis.createClient()

хранилище.bind 'chat',
	выбрать: (настройки, возврат) ->
		условия = настройки.условия || {}
		дополнительно = { skip: настройки.с - 1, limit: настройки.сколько }
		дополнительно.sort = настройки.sort
		@find(условия, дополнительно).toArray возврат

#subscriber.subscribe("chat")
		
болталка = websocket
	.of('/болталка')
	.on 'connection', (соединение) ->
		соединение.on 'пользователь', (id) ->
			цепь_websocket(соединение)
				.сделать ->
					id = хранилище.collection('people').id(id)
					хранилище.collection('people').findOne({ '_id': id }, @.в 'пользователь')
					
				.сделать (пользователь) ->
					if not пользователь?
						return @('Пользователь с номером ' + id + ' не найден')
					соединение.set 'пользователь', пользователь, @

				.сделать () ->
					пользователь = @.переменная 'пользователь'
					
					данные_пользователя =
						имя: пользователь.имя
						'адресное имя': пользователь['адресное имя']
						
					online.hset('chat:online', id, JSON.stringify(данные_пользователя), @)
				
				.сделать () ->	
					online.hgetall('chat:online', @)
					
				.сделать (who_is_online) ->
					пользователь = @.переменная 'пользователь'
					
					who_is_online_info = []
					for id, json of who_is_online
						if id + '' != пользователь._id + ''
							who_is_online_info.push(JSON.parse(json))
							
					соединение.emit 'online', who_is_online_info
					соединение.broadcast.emit('user_online', пользовательское.выбрать_поля(['адресное имя', 'имя', '_id', 'пол'], пользователь))
					соединение.emit 'готов'
		
		соединение.on 'смотрит', (сообщение) ->
			цепь_websocket(соединение)
				.сделать ->
					соединение.get 'пользователь', @
				.сделать (пользователь) ->
					соединение.broadcast.emit('смотрит', пользовательское.выбрать_поля(['адресное имя', '_id'], пользователь))
				
		соединение.on 'не смотрит', (сообщение) ->
			цепь_websocket(соединение)
				.сделать ->
					соединение.get 'пользователь', @
				.сделать (пользователь) ->
					соединение.broadcast.emit('не смотрит', пользовательское.выбрать_поля(['адресное имя', '_id'], пользователь))
		
		соединение.on 'сообщение', (сообщение) ->
			сообщение = сообщение.escape_html()
			#сообщение = sanitize(сообщение).xss()
			время = снасти.сейчас({ минуты: yes })
			
			цепь_websocket(соединение)
				.сделать ->
					соединение.get 'пользователь', @.в 'отправитель'
					
				.сделать (отправитель) ->
					хранилище.collection('chat').save { 'отправитель': отправитель._id, 'сообщение': сообщение, 'время': время }, @
					
				.сделать () ->
					отправитель = @.переменная "отправитель"
					данные_сообщения =
					{
						отправитель:
							имя: отправитель.имя,
							'адресное имя': отправитель['адресное имя']
						сообщение: сообщение
						время: время
					}
					
					#publisher.publish("chat", "messages:" + id)
					
					соединение.emit('сообщение', данные_сообщения)
					соединение.broadcast.emit('сообщение', данные_сообщения)
	
		соединение.on 'disconnect', () ->
			пользователь = null
			цепь(websocket)
				.сделать ->
					соединение.get 'пользователь', @
					
				.сделать (user) ->
					пользователь = user
					online.hdel('chat:online', пользователь._id, @)
					
				.сделать () ->
					соединение.broadcast.emit('offline', пользовательское.выбрать_поля(['адресное имя', 'имя', '_id'], пользователь))
		
		###
		соединение.emit('a message',
		{
			that: 'only',
			'/chat': 'will get'
		})
		
		болталка.emit('a message',
		{
			everyone: 'in',
			'/chat': 'will get'
		})
		###
		
http.get '/болталка/сообщения', (ввод, вывод) ->
	return if пользовательское.требуется_вход(ввод, вывод)
	цепь(вывод)
		.сделать ->
			хранилище.collection('chat').count @.в 'количество сообщений'
		
		.сделать ->
			хранилище.collection('chat').выбрать { с: ввод.настройки.с, сколько: ввод.настройки.сколько, sort: [['$natural', -1]] }, @.в 'сообщения'

		.все_вместе (сообщение) ->
			хранилище.collection('people').findOne { _id: сообщение.отправитель }, @

		.сделать (отправители) ->
			@.переменная('сообщения').forEach (сообщение, индекс) ->
				сообщение.отправитель = пользовательское.выбрать_поля(['имя', 'адресное имя', 'пол'], отправители[индекс])
			@()
			
		.сделать ->
			есть_ли_ещё = @.переменная('количество сообщений') > (ввод.настройки.с - 1 + ввод.настройки.сколько)
			вывод.send сообщения: @.переменная('сообщения'), 'есть ещё?': есть_ли_ещё 