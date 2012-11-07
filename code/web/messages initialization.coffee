#require 'coffee-trace'

global.prepare_messages = (options) ->
	options.collection = options.id
		
	if options.общение_во_множественном_числе?
		options.messages_collection = 'messages'
		options.path = (environment) -> options.общение_во_множественном_числе + '.' + environment.сообщения_чего._id
			
		options.messages_query = (environment) ->
			query = {}
			query.чего = options.общение
			if environment.сообщения_чего._id.toHexString?
				query.общение = environment.сообщения_чего._id
			else
				query.общение = collection.id(environment.сообщения_чего._id)
			query
			
		options.notified_users = (общение) -> общение.подписчики
	else
		options.messages_collection = options.id
		options.path = (environment) -> options.общение
		
	options.uri = '/' + options.общение
	options.data_uri = '/сеть/' + options.общение + '/сообщения'

	save = options.save
	options.save = (сообщение, environment, возврат) ->
		data =
			отправитель: environment.пользователь._id
			сообщение: сообщение
			когда: new Date()
			
		if options.общение_во_множественном_числе?
			data.общение = environment.сообщения_чего._id
			data.чего = options.общение
				
		цепь(возврат)
			.сделать ->
				db(options.messages_collection).save(data, @._.в 'сообщение')
				
			.сделать ->
				if options.общение_во_множественном_числе?
					return db(options.collection).update({ _id: environment.сообщения_чего._id }, { $set: { обновлено: data.когда } }, @)
				@.done()

			.сделать ->
				if save?
					return save(@._.сообщение, environment, @)
				@.done()
				
			.сделать ->
				@.done(@._.сообщение)
	
	if options.общение_во_множественном_числе?
		options.сообщения_чего_from_string = (сообщения_чего) ->
			if сообщения_чего._id.toHexString?
				return сообщения_чего
			сообщения_чего._id = db(options.collection).id(сообщения_чего._id)
			return сообщения_чего
		
		options.создатель = (_id, возврат) ->
			if typeof _id == 'string'
				_id = db(options.id).id(_id)
			
			цепь(возврат)
				.сделать ->
					db(options.messages_collection).find({ общение: _id, чего: options.общение }, { sort: [['_id', 1]], limit: 1 }).toArray(@)
					
				.сделать (сообщения) ->
					if сообщения.пусто()
						return @.error("Не удалось проверить авторство")
						
					@.done(сообщения[0].отправитель)

		сообщения_чего_extra = options.сообщения_чего
					
		options.сообщения_чего = (ввод, возврат) ->
			цепь(возврат)
				.сделать ->
					if ввод.настройки._id?
						return db(options.collection).findOne({ _id: ввод.настройки._id }, @)
					
					db(options.collection).findOne({ id: ввод.настройки.id }, @)
					
				.сделать (сообщения_чего) ->
					result = Object.выбрать(['_id', 'название'], сообщения_чего)
					if сообщения_чего_extra?
						сообщения_чего_extra(result, сообщения_чего)
					@.done(result)
					
		extra_get = options.extra_get
		
		options.extra_get = (data, environment, возврат) ->
			data.название = environment.сообщения_чего.название
			data._id = environment.сообщения_чего._id
			if extra_get?
				extra_get(data, environment)
			возврат()
					
	options.latest_read = (session, environment) ->
		return Object.path(session, 'последние_прочитанные_сообщения.' + options.path(environment))

	options.message_read = (_id, environment, возврат) ->
				
		цепь(возврат)
			.сделать ->
				path = 'последние_прочитанные_сообщения.' + options.path(environment)
		
				query = { пользователь: environment.пользователь._id }
				
				query.$or = []
					
				query.$or.push({ последние_прочитанные_сообщения: { $exists: 0 } })
				
				less_than = {}
				less_than[path] = { $lt: _id }
				
				nothing_read_yet = {}
				nothing_read_yet[path] = { $exists: 0 }
				
				query.$or.push(less_than)
				query.$or.push(nothing_read_yet)
					
				actions = $set: {}
				actions.$set[path] = _id
				
				db('people_sessions').update(query, actions, @)
				
	options.notify = (_id, environment, возврат) ->
		цепь(возврат)
			.сделать ->
				if options.общение_во_множественном_числе?
					return db(options.collection).findOne({ _id: environment.сообщения_чего._id }, @)
				@.done()
				
			.сделать (общение) ->
				query = {}
				query[options.path(environment)] = { $lt: _id }
				
				users = []
				if options.notified_users?
					users = options.notified_users(общение)
					query.пользователь = { $in: users }
				
				setter = {}
				setter['последние_сообщения.' + options.path(environment)] = _id
				
				db('people_sessions').update(query, { $set: setter }, { multi: yes })
				
				@.done(users.map((_id) -> _id.toString()))
				
			.сделать (users) ->
				if not users.пусто()
					for user in users
						if user != environment.пользователь._id.toString()
							эфир.отправить('новости', options.общение, { _id: environment.сообщения_чего._id.toString(), сообщение: _id.toString() }, { кому: user })
				else	
					эфир.отправить('новости', options.общение, { _id: _id.toString() }, { кроме: environment.пользователь._id })

				for пользователь in эфир.пользователи()
					if пользователь != environment.пользователь._id + ''
						if !users.пусто() && !users.has(пользователь)
							continue
						
						criteria = { пользователь: пользователь }
						if environment.сообщения_чего?
							criteria._id = environment.сообщения_чего._id.toString()
							
						соединение_с_общением = эфир.соединение_с(options.общение, criteria)
						if not соединение_с_общением
							эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: options.общение }, { кому: пользователь })
							
				@.done()

	options.mark_new = (сообщения, environment, возврат) ->
		цепь(возврат)
			.сделать ->
				db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
				
			.сделать (session) ->
				path = 'последние_прочитанные_сообщения.' + options.path(environment)
				latest_read = Object.path(session, path)
				
				if not latest_read?
					for сообщение in сообщения
						сообщение.новое = yes
					return @.return()
					
				for сообщение in сообщения
					if сообщение._id + '' > latest_read + ''
						сообщение.новое = yes
				
				@.done()
	
	if options.private?
		options.extra_get = (data, environment) ->
			data.участники = environment.сообщения_чего.участники
		
		options.notified_users = (общение) -> общение.участники
			
		options.authorize = (environment, возврат) ->
			цепь(возврат)
				.сделать ->
					db(options.collection).findOne({ _id: environment.сообщения_чего._id }, @)
					
				.сделать (общение) ->
					if not общение.участники?
						throw { error: 'Вы не участвуете в этом общении', display_this_error: yes }
					
					if not общение.участники.map((_id) -> _id + '').has(environment.пользователь._id + '')
						throw { error: 'Вы не участвуете в этом общении', display_this_error: yes }
					
					@.done()
					
		добавить_в_общение = (_id, добавляемый, пользователь, возврат) ->
			цепь(возврат)
				.сделать ->
					db(options.collection).findOne({ _id: _id }, @)
					
				.сделать (общение) ->
					нет_прав = yes
				
					if общение.участники?
						for участник in общение.участники
							if участник + '' == добавляемый + ''
								return вывод.send({ уже_участвует: yes })
							if участник + '' == пользователь._id + ''
								нет_прав = no
								
					if нет_прав
						return вывод.send(ошибка: "Вы не участник этого общения, и поэтому \n не можете добавлять в неё людей")
		
					db(options.collection).update({ _id: _id }, { $addToSet: { участники: добавляемый } }, @)
					
				.сделать ->
					db('people_sessions').findOne({ пользователь: добавляемый }, @)
					
				.сделать (session) ->
					query = { чего: options.общение, общение: _id }
					
					latest_read = options.latest_read(session, { сообщения_чего: { _id: _id } })
					if latest_read?
						query._id = { $gt: latest_read }
						
					db(options.messages_collection).find(query).toArray(@)
					
				.сделать (unread_messages) ->
					unread_message_ids = unread_messages.map((message) -> message._id.toString())
					
					эфир.отправить('новости', options.сообщения_чего, { _id: _id.toString(), сообщения: unread_message_ids }, { кому: добавляемый })
					
					set_id = 'новости.' + options.path({ сообщения_чего: { _id: _id } })
					
					set_operation = {}
					set_operation[set_id] = { $each: unread_message_ids }
					
					db('people_sessions').update({ пользователь: добавляемый }, { $addToSet: set_operation }, @)
			
		options.creation_extra = (_id, пользователь, ввод, возврат) ->
			кому = ввод.body.кому
			
			if not кому?
				return возврат()
			
			добавить_в_общение(_id, db('people').id(кому), пользователь, возврат)
		
		http.put  '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = db(options.collection).id(ввод.body[options.общение])
			добавляемый = db('people').id(ввод.body.пользователь)
			
			цепь(вывод)
				.сделать ->
					добавить_в_общение(_id, добавляемый, пользователь, @)
					
				.сделать ->
					вывод.send {}
						
		http.delete '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			
			цепь(вывод)
				.сделать ->
					db(options.collection).update({ _id: db(options.collection).id(_id) }, { $pull: { участники: пользователь._id } }, @)
					
				.сделать ->
					set_id = 'последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })
					db('people_sessions').update({ пользователь: пользователь._id }, { $unset: set_id }, @)
					
				.сделать ->
					новости.уведомления(пользователь, @)
					
				.сделать (уведомления) ->
					эфир.отправить('новости', 'уведомления', уведомления)
					вывод.send {}