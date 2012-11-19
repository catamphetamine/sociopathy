global.messages_tools = (options) ->
	result = {}
	
	initial_options = options
	
	result.enable_message_editing = (url, options) ->
		options = options || {}
		
		http.post '/сеть/' + url + '/сообщения/правка', (ввод, вывод, пользователь) ->
			цепь(вывод)
				.сделать ->
					@.done(JSON.parse(ввод.body.messages))
					
				.все_вместе (data) ->
					@._.data = data
					
					if options.update?
						options.update(data._id, пользователь._id, data.content, @)
					else
						_id = db(options.messages_collection).id(data._id)
						db(options.messages_collection).update({ _id: _id, отправитель: пользователь._id }, { $set: { сообщение: data.content } }, @)
					
				.сделать ->
					if !options.update?
						_id = db(options.messages_collection).id(@._.data._id)
						return db(options.messages_collection).findOne({ _id: _id }, @._.в 'message')
					@.done()
						
				.сделать ->
					data = { _id: @._.data._id, сообщение: @._.data.content }
					if @._.message?
						data.чего_id = @._.message.общение
					data.чего = options.общение
					эфир.отправить('сообщения', 'правка', data, { кроме: пользователь._id })
					вывод.send {}
					
	result.enable_unsubscription = (url) ->
		http.delete '/сеть/' + url + '/подписка', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			
			цепь(вывод)
				.сделать ->
					db(options.id).update({ _id: db(options.id).id(_id) }, { $pull: { подписчики: пользователь._id } }, @)
					
				.сделать ->
					set_id = 'последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })
					db('people_sessions').update({ пользователь: environment.пользователь._id }, { $unset: set_id }, @)
					
				.сделать ->
					новости.уведомления(пользователь, @)
					
				.сделать (уведомления) ->
					эфир.отправить('новости', 'уведомления', уведомления)
					вывод.send {}
		
	result.enable_renaming = (url) ->
		http.post '/сеть/' + url + '/переназвать', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			название = ввод.body.название.trim()
			
			цепь(вывод)
				.сделать ->
					options.создатель(_id, @)
				
				.сделать (создатель) ->
					if создатель + '' != пользователь._id + ''
						return вывод.send { ошибка: "Вы не создатель этого общения, и не можете его переименовать" }
						
					db(options.id).update({ _id: db(options.id).id(_id) }, { $set: { название: название } }, @)
					
				.сделать ->
					эфир.отправить(options.общение, 'переназвано', { _id: _id, как: название })
					вывод.send {}
				
	result.enable_creation = (url, append) ->
		http.put '/сеть/' + url, (ввод, вывод, пользователь) ->
			название = ввод.body.название.trim()
			сообщение = ввод.body.сообщение
			
			environment =
				пользователь: пользователь
				
			цепь(вывод)
				.сделать ->
					проверка = (id, возврат) ->
						цепь(возврат)
							.сделать ->
								db(options.id).findOne({ id: id }, @)
								
							.сделать (found) ->
								@.done(not found?)
								
					снасти.generate_unique_id(название, проверка, @.в 'id')
					
				.сделать (id) ->
					values = { название: название, id: id, создано: new Date() }
					
					if append?
						append(values, environment)
					
					db(options.collection).save(values, @._.в 'общение')
					
				.сделать (общение) ->
					environment.сообщения_чего = { _id: общение._id }
					
					options.save(сообщение, environment, @)
				
				.сделать (сообщение) ->
					options.message_read(сообщение._id, environment, @)
										
				.сделать ->
					if options.creation_extra?
						return options.creation_extra(@._.общение._id, пользователь, ввод, @)
					@.done()
					
				.сделать ->
					return вывод.send { id: @.$.id }

	result