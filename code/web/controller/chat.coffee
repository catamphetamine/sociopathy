#sanitize = require('validator').sanitize

# redis clients
#store = redis.createClient()
#publisher = redis.createClient()
#subscriber = redis.createClient()
online = redis.createClient()

#subscriber.subscribe("chat")

соединения_пользователей = {}

болталка = websocket
	.of('/болталка')
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
					
				.сделать () ->
					online.hset('chat:online', пользователь._id.toString(), JSON.stringify(пользователь), @)
				
				.сделать () ->
					online.hgetall('chat:online', @)
					
				.сделать (who_is_online) ->
					who_is_online_info = []
					for id, json of who_is_online
						if id + '' != пользователь._id + ''
							who_is_online_info.push(JSON.parse(json))
							
					соединение.emit 'online', who_is_online_info
					соединение.broadcast.emit('user_online', пользовательское.выбрать_поля(['адресное имя', 'имя', '_id', 'пол'], пользователь))
					соединение.emit 'готов'
			
			соединение.on 'смотрит', () ->
				соединение.broadcast.emit('смотрит', пользовательское.выбрать_поля(['_id'], пользователь))
					
			соединение.on 'не смотрит', () ->
				соединение.broadcast.emit('не смотрит', пользовательское.выбрать_поля(['_id'], пользователь))
			
			соединение.on 'вызов', (_id) ->
				вызываемый = соединения_пользователей[_id]
				if not вызываемый
					return соединение.emit('ошибка', 'Вызываемый пользователь недоступен')
				вызываемый.emit('вызов', пользователь)
			
			соединение.on 'пишет', ->
				соединение.broadcast.emit('пишет', пользователь)
			
			соединение.on 'сообщение', (сообщение) ->
				#сообщение = сообщение.escape_html()
				#сообщение = sanitize(сообщение).xss()
				#время = снасти.сейчас({ минуты: yes })
				
				цепь_websocket(соединение)
					.сделать ->
						sanitize(сообщение, @)
						
					.сделать (сообщение) ->
						хранилище.collection('chat').save { 'отправитель': пользователь._id, 'сообщение': сообщение, 'время': new Date() }, @.в 'сообщение'
						
					.сделать (сообщение) ->
						пользовательское.set_session_data(тайный_ключ, 'последнее сообщение в болталке', сообщение._id, @)
						
					.сделать ->
						сообщение = @.переменная 'сообщение'
						данные_сообщения =
							отправитель: пользовательское.выбрать_поля(['адресное имя', 'имя', '_id'], пользователь)
							сообщение: сообщение.сообщение
							время: сообщение.время
						
						#console.log 'данные_сообщения:'
						#console.log данные_сообщения
						
						#publisher.publish("chat", "messages:" + id)
						
						#соединение.emit('сообщение', данные_сообщения)
						#соединение.broadcast.emit('сообщение', данные_сообщения)
						болталка.emit('сообщение', данные_сообщения)
		
			соединение.on 'disconnect', () ->
				delete соединения_пользователей[пользователь._id.toString()]
				цепь(websocket)
					.сделать ->
						online.hdel('chat:online', пользователь._id, @)
						
					.сделать () ->
						соединение.broadcast.emit('offline', пользовательское.выбрать_поля(['_id'], пользователь))

Max_batch_size = 1000
						
http.get '/болталка/сообщения', (ввод, вывод) ->
	return if пользовательское.требуется_вход(ввод, вывод)
	
	цепь(вывод)
		.сделать ->
			начиная_с_какого_выбрать(ввод, @.в 'с_какого_выбрать')
				
		.сделать (с_какого_выбрать) ->
			if not с_какого_выбрать?
				return хранилище.collection('chat').find({}, { limit: ввод.настройки.сколько, sort: [['$natural', -1]] }).toArray(@.в 'сообщения')
			выбрать(с_какого_выбрать, ввод.настройки.сколько, ввод, @.в 'сообщения')
			
		.все_вместе (сообщение) ->
			хранилище.collection('people').findOne { _id: сообщение.отправитель }, @
	
		.сделать (отправители) ->
			@.переменная('сообщения').forEach (сообщение, индекс) ->
				сообщение.отправитель = пользовательское.выбрать_поля(['имя', 'адресное имя', 'пол', '_id'], отправители[индекс])
			@()
			
		.сделать ->
			сообщения = @.переменная 'сообщения'
			return @.done() if сообщения.length == 0
			хранилище.collection('chat').find({ _id: { $lt: сообщения[сообщения.length - 1]._id }}, { sort: [['$natural', -1]], limit: 1 }).toArray @
				
		.сделать (ещё_сообщения) ->
			есть_ли_ещё = no
			if ещё_сообщения.length > 0
				есть_ли_ещё = yes
				
			вывод.send { сообщения: @.переменная('сообщения'), 'есть ещё?': есть_ли_ещё }

начиная_с_какого_выбрать = (ввод, возврат) ->
	if ввод.настройки.после?
		return возврат.done({ с: хранилище.collection('chat').id(ввод.настройки.после), прихватить_границу: no, откуда: 'раньше' })

	с_какого_выбрать = ввод.session.data['последнее сообщение в болталке']
	return возврат.done({ с: хранилище.collection('chat').id(с_какого_выбрать), ограничение: Max_batch_size, откуда: 'позже' }) if с_какого_выбрать?
	
	new Цепочка(возврат)
		.сделать ->
			id = ввод.session.пользователь._id
			хранилище.collection('chat').find({ отправитель: id }, { sort: [['$natural', -1]], limit: 1 }).toArray @
		
		.сделать (сообщения) ->
			сообщение = сообщения[0]
			return @.done({ с: сообщение._id, ограничение: Max_batch_size, откуда: 'позже' }) if сообщение?
			return @.done()
				
выбрать = (с_какого, сколько, ввод, возврат) ->
	с = с_какого.с
	ограничение = ввод.настройки.сколько
	сравнение_id = null
	
	if not с_какого.откуда?
		с_какого.откуда = 'раньше'
	
	if с_какого.ограничение?
		ограничение = с_какого.ограничение
		
	if с_какого.откуда == 'раньше'
		сравнение_id = '$lte'
	else if с_какого.откуда == 'позже'
		сравнение_id = '$gte'

	if с_какого.прихватить_границу == no
		if сравнение_id = '$lte'
			сравнение_id = '$lt'
		else if сравнение_id = '$gte'
			сравнение_id = '$gt'
	
	id_criteria = {}
	id_criteria[сравнение_id] = с
	хранилище.collection('chat').find({ _id: id_criteria }, { limit: ограничение, sort: [['$natural', -1]] }).toArray возврат

# это временно
	
jsdom  = require 'jsdom'
jQuery = require('fs').readFileSync(process.cwd() + '/code/web/tools/jquery.js').toString()

sanitize = (html, возврат) ->
	
	for_jsdom =
		html: '<pre>' + html + '</pre>',
		src: [jQuery],
		done: (errors, window) ->
			if (errors)
				return возврат(errors)
				
			$ = window.$
					
			$('script').remove()
		
			remove_attributes = [
				'onblur'
				'onchange'
				'onclick'
				'ondblclick'
				'onfocus'
				'onfocusin'
				'onfocusout'
				'onmouseover'
				'onmousemove'
				'onmousedown'
				'onmouseup'
				'onkeydown'
				'onkeyup'
				'onkeypress'
				'onresize'
				'onscroll'
				'onselect'
				'onsubmit'
				'onreset'
				'onload'
				'onunload'
			]
		
			for attribute in remove_attributes
				$('*').removeAttr(attribute)
				
			console.log($('pre:first').html())
			возврат(null, $('pre:first').html())
			
	jsdom.env(for_jsdom)