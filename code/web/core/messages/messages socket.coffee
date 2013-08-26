global.prepare_messages_socket = (options) ->
	fiber ->
		connected = redis.createClient()
		
		collection = db(options.messages_collection)

		message_read = (_id, environment) ->
			if typeof _id == 'string'
				_id = collection.id(_id)
				
			options.message_read.do(_id, environment)
			
		сообщения_чего = (чего) ->
			if not options.сообщения_чего_from_string?
				return чего
				
			return options.сообщения_чего_from_string(чего)
			
		communication = (environment) ->
			environment.сообщения_чего = сообщения_чего(environment.сообщения_чего)
	
			connected_data_source = ->
				if not environment.сообщения_чего?
					return options.id + ':connected'
				options.id + ':' + environment.сообщения_чего._id + ':connected'
			
			пользователь = environment.пользователь
	
			общение = 
				disconnect: ->
					if пользователь?
						connected.hdel.fiberize(connected)(connected_data_source(), пользователь._id)
						@broadcast('отцепился', пользовательское.поля([], пользователь))
						
				connect: ->
					if options.authorize?
						options.authorize.do(environment)
				
					@on 'кто здесь?', =>
						who_is_connected = connected.hgetall.fiberize(connected)(connected_data_source())
						
						who_is_connected_info = []
						for id, json of who_is_connected
							if id + '' != пользователь._id + ''
								who_is_connected_info.add(JSON.parse(json))
								
						@emit('кто здесь', who_is_connected_info)
					
					@on 'получить пропущенные сообщения', (с_какого) =>
						Max_lost_messages = 100
						
						query = options.these_messages_query({ _id: { $gte: collection.id(с_какого._id) } }, environment)
						
						if collection._.count(query) > Max_lost_messages
							throw 'Слишком много сообщений пропущено'
						 
						сообщения = collection._.find(query, { sort: [['_id', 1]] })
						
						пользовательское.подставить.do(сообщения, 'отправитель')
						
						@emit('пропущенные сообщения', сообщения)
							
					@on 'смотрит', =>
						@broadcast('смотрит', пользовательское.поля(пользователь))
							
					@on 'не смотрит', =>
						@broadcast('не смотрит', пользовательское.поля(пользователь))
					
					@on 'вызов', (_id) =>
						if not эфир.отправить('общее', 'вызов', пользовательское.поля(пользователь), { кому: _id })
							@emit('ошибка', 'Вызываемый пользователь недоступен')
					
					@on 'пишет', =>
						@broadcast('пишет', пользовательское.поля(['имя'], пользователь))
					
					@on 'сообщение', (data) =>
						сообщение = data.сообщение
					
						сообщение = options.save.do(сообщение, environment)
						
						сообщение.simplified = data.simplified
						
						message_read(сообщение._id, environment)
						
						if options.subscribe?
							options.subscribe.do(environment)
						
						options.notify.do(сообщение, environment)
								
						данные_сообщения =
							_id: сообщение._id.toString()
							отправитель: пользовательское.поля(пользователь)
							сообщение: сообщение.сообщение
							когда: сообщение.когда
							
						предыдущие_сообщения = db(options.messages_collection)._.find(options.these_messages_query({ _id: { $lt: сообщение._id } }, environment), { limit: 1, sort: [['_id', -1]] })
							
						if not предыдущие_сообщения.пусто()
							данные_сообщения.предыдущее = предыдущие_сообщения[0]._id.toString()
						
						@emit('сообщение', данные_сообщения)
						@broadcast('сообщение', данные_сообщения)
																			
					@on 'прочитано', (_id) ->
						message_read(_id, environment)
						
						data =
							что: options.общение
							_id: _id
						
						if environment.сообщения_чего?
							data.сообщения_чего = environment.сообщения_чего._id.toString()
						
						эфир.отправить.do('новости', 'прочитано', data, { кому: пользователь._id })
						
					connected.hset.fiberize(connected)(connected_data_source(), пользователь._id.toString(), JSON.stringify(пользовательское.поля(пользователь)))
						
					@broadcast('подцепился', пользовательское.поля(пользователь))
					@emit('готов')
					
			return общение
			
		if options.общение_во_множественном_числе?
			communication.multiple = yes
			
		communication.message_read = message_read
		communication.сообщения_чего = сообщения_чего
			
		эфир.общения[options.общение] = communication
