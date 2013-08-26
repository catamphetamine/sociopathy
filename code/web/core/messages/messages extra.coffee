global.messages_tools = (options) ->
	result = {}
	
	initial_options = options
	
	result.enable_message_editing = (url, options) ->
		options = options || {}
		
		http.post '/сеть/' + url + '/сообщения/правка', (ввод, вывод, пользователь) ->
			for data in JSON.parse(ввод.данные.messages)
				if options.update?
					options.update.do(data._id, пользователь._id, data.content)
				else
					_id = db(initial_options.messages_collection).id(data._id)
					db(initial_options.messages_collection)._.update({ _id: _id, отправитель: пользователь._id }, { $set: { сообщение: data.content } })

					message = db(initial_options.messages_collection)._.find_one({ _id: _id })

					data = { _id: data._id, сообщение: data.content }
					if message?
						data.чего_id = message.общение
					data.чего = options.общение
					эфир.отправить('сообщения', 'правка', data, { кроме: пользователь._id })
					
			вывод.send {}
					
	result.enable_unsubscription = (url) ->
		http.delete '/сеть/' + url + '/подписка', (ввод, вывод, пользователь) ->
			_id = ввод.данные._id
			
			db(options.id)._.update({ _id: db(options.id).id(_id) }, { $pull: { подписчики: пользователь._id } })
					
			set_id = 'последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })
			unset = {}
			unset[set_id] = yes
			
			db('people_sessions')._.update({ пользователь: пользователь._id }, { $unset: unset })
					
			уведомления = новости.уведомления(пользователь)
			
			эфир.отправить('новости', 'уведомления', уведомления)
			вывод.send {}
		
	result.enable_renaming = (url) ->
		http.post '/сеть/' + url + '/переназвать', (ввод, вывод, пользователь) ->
			_id = ввод.данные._id
			название = ввод.данные.название.trim()
			
			создатель = options.создатель.do(_id)
		
			if создатель + '' != пользователь._id + ''
				throw "Вы не создатель этого общения, и не можете его переименовать"
			
			db(options.id)._.update({ _id: db(options.id).id(_id) }, { $set: { название: название } })
			
			эфир.отправить(options.общение, 'переназвано', { _id: _id, как: название })
			вывод.send {}
				
	result.enable_creation = (url, append) ->
		http.put '/сеть/' + url, (ввод, вывод, пользователь) ->
			название = ввод.данные.название.trim()
			сообщение = ввод.данные.сообщение
			
			environment =
				пользователь: пользователь
				
			проверка = (id) ->
				found = db(options.id)._.find_one({ id: id })
				return not found?
						
			id = снасти.generate_unique_id(название, проверка)
			
			values = { название: название, id: id, создано: new Date() }
			
			if append?
				append(values, environment)
			
			общение = db(options.collection)._.save(values)
			
			environment.сообщения_чего = { _id: общение._id }
			
			сообщение = options.save.do(сообщение, environment)
		
			options.message_read.do(сообщение._id, environment)
								
			if options.creation_extra?
				options.creation_extra.do(общение._id, пользователь, ввод)
			
			вывод.send { id: id }

	result