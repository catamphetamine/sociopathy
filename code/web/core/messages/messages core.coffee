#require 'coffee-trace'

global.prepare_messages = (options) ->
	options.collection = options.id

	options.these_messages_query = (query, environment) ->
		if not options.messages_query?
			return query
		
		Object.merge_recursive(Object.clone(query), options.messages_query(environment))
		
	if options.общение_во_множественном_числе?
		options.messages_collection = options.id + '_messages'
		options.path = (environment) -> options.общение_во_множественном_числе + '.' + environment.сообщения_чего._id
			
		options.messages_query = (environment) ->
			query = {}
			if environment.сообщения_чего._id.toHexString?
				query.общение = environment.сообщения_чего._id
			else
				query.общение = collection.id(environment.сообщения_чего._id)
			query
			
		options.notified_users = (общение) ->
			if общение.подписчики?
				return общение.подписчики
			return []
		
		дополнить_общения = (общения) ->
			пользовательское.подставить.await(общения, 'участники')
			
			if options.bulk_get_extra?
				options.bulk_get_extra(общения)
		
			последние_сообщения = []
		
			for общение in общения
				последние_сообщения.add(db(options.messages_collection)._.find({ общение: общение._id }, { sort: [['_id', -1]], limit: 1 }))
				
			сообщения = []
			for array in последние_сообщения
				if not array.пусто()
					сообщения.add(array[0])
			
			последние_сообщения = сообщения
			последние_сообщения = пользовательское.подставить.await(последние_сообщения, 'отправитель')
			
			последние_сообщения.merge_into(общения, 'последнее_сообщение', (общение) -> @.общение + '' == общение._id + '')
			
		bulk_uri = '/сеть/' + options.общение_во_множественном_числе
		unread_uri = bulk_uri + '/непрочитанные'
		
		http.get unread_uri, (ввод, вывод, пользователь) ->
			environment =
				пользователь: пользователь
			
			if options.authorize?
				options.authorize.await(environment)
			
			непрочитанные = ->
				session = пользовательское.session(пользователь)
				
				if not session.последние_сообщения?
					return []
				
				последние_сообщения = session.последние_сообщения[options.общение_во_множественном_числе]
					
				if not последние_сообщения?
					return []

				последние_прочитанные_сообщения = null
				
				if session.последние_прочитанные_сообщения?
					последние_прочитанные_сообщения = session.последние_прочитанные_сообщения[options.общение_во_множественном_числе]
					
				if not последние_прочитанные_сообщения?
					последние_прочитанные_сообщения = {}

				непрочитанные = []
				for _id, сообщение of последние_сообщения
					if последние_прочитанные_сообщения[_id] + '' != сообщение + ''
						непрочитанные.add(db(options.collection).id(_id))
				
				return db(options.collection)._.find({ _id: { $in: непрочитанные }}, { sort: [['обновлено_по_порядку', -1]] })
			
			$ = {}
			
			общения = дополнить_общения(непрочитанные())
			$[options.общение_во_множественном_числе] = общения
			
			вывод.send $
		
		http.get bulk_uri, (ввод, вывод, пользователь) ->
			if not options.общения_query?
				options.общения_query = () -> {}
		
			$ = {}
			
			loading_options =
				from: options.collection
				query: options.общения_query(пользователь)
				more_query: (last, more_query) ->
					more_query.обновлено_по_порядку = { $lt: last.обновлено_по_порядку }
				parameters:
					sort: [['обновлено_по_порядку', -1]]
				после_query: (после, query) ->
					query.обновлено_по_порядку = { $lt: после }
			
			общения = снасти.batch_loading(ввод, $, options.общение_во_множественном_числе, loading_options)
			дополнить_общения(общения)
			
			вывод.send $
			
	else
		options.messages_collection = options.id
		options.path = (environment) -> options.общение
		
	#options.uri = '/' + options.общение
	options.data_uri = '/сеть/' + options.общение + '/сообщения'

	save = options.save
	options.save = (сообщение, environment, возврат) ->
		data =
			отправитель: environment.пользователь._id
			сообщение: сообщение
			когда: new Date()
			
		if options.общение_во_множественном_числе?
			data.общение = environment.сообщения_чего._id
				
		сообщение = db(options.messages_collection)._.save(data)
				
		if options.общение_во_множественном_числе?
			db(options.collection)._.update({ _id: environment.сообщения_чего._id }, { $set: { обновлено: data.когда,  обновлено_по_порядку: data.когда.getTime() + data.общение } })

		if save?
			save(сообщение, environment)
		
		возврат(null, сообщение)
	
	if options.общение_во_множественном_числе?
		options.сообщения_чего_from_string = (сообщения_чего) ->
			if сообщения_чего._id.toHexString?
				return сообщения_чего
			сообщения_чего._id = db(options.collection).id(сообщения_чего._id)
			return сообщения_чего
		
		options.создатель = (_id, возврат) ->
			if typeof _id == 'string'
				_id = db(options.id).id(_id)
			
			сообщения = db(options.messages_collection)._.find({ общение: _id }, { sort: [['_id', 1]], limit: 1 })
					
			if сообщения.пусто()
				throw "Не удалось проверить авторство"
						
			возврат(null, сообщения[0].отправитель)

		if options.private?
			options.notified_users = (общение) -> общение.участники
				
			options.authorize = (environment, возврат) ->
				общение = хранилище.collection(options.collection)._.find_one({ _id: environment.сообщения_чего._id })
						
				if not общение.участники?
					throw { error: 'Вы не участвуете в этом общении', display_this_error: yes }
				
				if not общение.участники.map((_id) -> _id + '').has(environment.пользователь._id + '')
					throw { error: 'Вы не участвуете в этом общении', display_this_error: yes }
				
				возврат()
						
			options.добавить_в_общение = (_id, добавляемый, пользователь, возврат) ->
				общение = db(options.collection)._.find_one({ _id: _id })
						
				нет_прав = yes
			
				if общение.участники?
					for участник in общение.участники
						if участник + '' == добавляемый + ''
							return возврат(null, { уже_участвует: yes })
						if участник + '' == пользователь._id + ''
							нет_прав = no
							
				session = пользовательское.session(добавляемый)
				
				сам_себя = no
				
				if нет_прав
					if Object.path(session, 'сам_вышел_из_общений.' + options.path({ сообщения_чего: { _id: _id } }))?
						нет_прав = no
						сам_себя = yes
					
				if нет_прав
					throw "Вы не участник этого общения, и поэтому \n не можете добавлять в неё людей"
	
				db(options.collection)._.update({ _id: _id }, { $addToSet: { участники: добавляемый } })
				
				# если сам удалялся раньше - затереть это
				
				unset = {}
				unset['сам_вышел_из_общений.' + options.path({ сообщения_чего: { _id: _id } })] = yes
				
				db('people_sessions')._.update({ пользователь: добавляемый }, { $unset: unset })
				
				# теперь обновить новости
				
				query = { общение: _id }
					
				latest_messages = db(options.messages_collection)._.find(query, { limit: 1, sort: [['_id', -1]] })
		
				latest_message_id = latest_messages.map((message) -> message._id.toString())[0]
				
				has_new_messages = yes
				
				latest_read = options.latest_read(session, { сообщения_чего: { _id: _id } })
				
				if latest_read?
					if latest_read + '' == latest_message_id + ''
						has_new_messages = no
					
				if not сам_себя
					эфир.отправить('новости', options.общение + '.' + 'добавление', { id: общение.id, название: общение.название }, { кому: добавляемый })
				
				if has_new_messages
					эфир.отправить('новости', options.общение, { _id: _id.toString(), сообщение: latest_message_id }, { кому: добавляемый })
					
					set = {}
					set['последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })] = latest_message_id
					
					db('people_sessions')._.update({ пользователь: добавляемый }, { $set: set })
					
				возврат()
					
			options.creation_extra = (_id, пользователь, ввод, возврат) ->
				кому = ввод.данные.кому
				
				if not кому?
					return возврат()
				
				options.добавить_в_общение.await(_id, db('people').id(кому), пользователь)
				возврат()

		options.сообщения_чего = (ввод, возврат) ->
			сообщения_чего = null
		
			if ввод.данные._id?
				сообщения_чего = db(options.collection)._.find_one({ _id: db(options.collection).id(ввод.данные._id) })
			else
				сообщения_чего = db(options.collection)._.find_one({ id: ввод.данные.id })
	
			result = Object.выбрать(['_id', 'название'], сообщения_чего)
			if options.сообщения_чего_extra?
				options.сообщения_чего_extra(result, сообщения_чего)
			
			возврат(null, result)
					
		extra_get = (data, environment, возврат) ->
			if options.private?
				data.участники = environment.сообщения_чего.участники
			возврат()
					
		options.extra_get = (data, environment, возврат) ->
			data.название = environment.сообщения_чего.название
			data._id = environment.сообщения_чего._id
			
			if extra_get?
				extra_get.await(data, environment)
				
			возврат()
					
	options.latest_read = (session, environment) ->
		return Object.path(session, 'последние_прочитанные_сообщения.' + options.path(environment))

	options.message_read = (_id, environment, возврат) ->
		path = 'последние_прочитанные_сообщения.' + options.path(environment)

		query = { пользователь: environment.пользователь._id }
		
		query.$or = []
		
		less_than = {}
		less_than[path] = { $lt: _id }
		
		nothing_read_yet = {}
		nothing_read_yet[path] = { $exists: 0 }
		
		query.$or.add(less_than)
		query.$or.add(nothing_read_yet)
			
		actions = $set: {}
		actions.$set[path] = _id
		
		db('people_sessions')._.update(query, actions)
		
		возврат()
				
	options.notify = (сообщение, environment, возврат) ->
		_id = сообщение._id

		notify_users = []
	
		if options.общение_во_множественном_числе?
			общение = db(options.collection)._.find_one({ _id: environment.сообщения_чего._id })
			
			query = {}
			
			query.$or = []
						   
			subquery = {}
			subquery['последние_сообщения.' + options.path(environment)] = { $exists: 0 }
			query.$or.add(subquery)
			
			subquery = {}
			subquery['последние_сообщения.' + options.path(environment)] = { $lt: _id }
			query.$or.add(subquery)
			
			if options.notified_users?
				notify_users = options.notified_users(общение)
				query.пользователь = { $in: notify_users }
			
			setter = {}
			setter['последние_сообщения.' + options.path(environment)] = _id
			
			db('people_sessions')._.update(query, { $set: setter }, { multi: yes })
			
			notify_users = notify_users.map((_id) -> _id.toString()).filter((_id) -> _id != environment.пользователь._id + '')
		else
			if not options.info_collection?
				options.info_collection = options.collection + '_info'
			
			query = {}
			
			query.$or = []
			query.$or.add({ последнее_сообщение: { $exists: 0 } })
			query.$or.add({ последнее_сообщение: { $lt: _id } })
			
			db(options.info_collection)._.update(query, { $set: { последнее_сообщение: _id } })
		
		data =
			сообщение: _id.toString()
			text: сообщение.сообщение

		if environment.сообщения_чего?
			data._id = environment.сообщения_чего._id.toString()
			общение = db(options.collection)._.find_one({ _id: environment.сообщения_чего._id })
			data.id = общение.id
			data.отправитель = environment.пользователь
		
		if not notify_users.пусто()
			for пользователь in notify_users
				criteria =
					type: options.общение
					пользователь: пользователь

				if environment.сообщения_чего?
					criteria._id = environment.сообщения_чего._id.toString()
					
				соединение_с_общением = эфир.соединение_с(criteria)
				if not соединение_с_общением?
					эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: options.общение }, { кому: пользователь })
				
				эфир.отправить('новости', options.общение, data, { кому: пользователь })
		else
			эфир.отправить('новости', options.общение, data, { кроме: environment.пользователь._id })
		
		возврат()

	options.mark_new = (сообщения, environment, возврат) ->
		session = db('people_sessions')._.find_one({ пользователь: environment.пользователь._id })
		
		path = 'последние_прочитанные_сообщения.' + options.path(environment)
		latest_read = Object.path(session, path)
		
		if not latest_read?
			for сообщение in сообщения
				сообщение.новое = yes
			return возврат()
			
		for сообщение in сообщения
			if сообщение._id + '' > latest_read + ''
				сообщение.новое = yes
		
		возврат()
