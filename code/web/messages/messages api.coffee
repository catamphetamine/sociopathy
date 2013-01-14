global.messages_api = (options) ->
	show_from = (environment, возврат) ->
		цепь(возврат)
			.сделать ->
				db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
				
			.сделать (session) ->
				return @.done() if not session?
				return @.done(options.latest_read(session, environment))
			
	http.get options.data_uri, (ввод, вывод, пользователь) ->
		environment = {}
		environment.пользователь = пользователь
			
		loading_options =
			collection: options.messages_collection
					
		цепь(вывод)
			.сделать ->
				if options.сообщения_чего?
					return цепь(@)
						.сделать ->
							options.сообщения_чего(ввод, @)
						.сделать (сообщения_чего) ->
							environment.сообщения_чего = сообщения_чего
							@.done()
				@.done()
				
			.сделать ->
				if options.authorize?
					return options.authorize(environment, @)
				@.done()
				
			.сделать ->
				if not ввод.настройки.после?
					return цепь(@)
						.сделать ->
							show_from(environment, @)
							
						.сделать (show_from) ->
							loading_options.с = show_from
							@.done()
				@.done()
				
			.сделать ->
				loading_options.query = options.these_messages_query({}, environment)
	
				either_way_loading(ввод, loading_options, @)
							
			.сделать (result) ->
				@.$.сообщения = result.data
				@.$['есть ещё?'] = result['есть ещё?']
				@.$['есть ли предыдущие?'] = result['есть ли предыдущие?']
				
				пользовательское.подставить(@.$.сообщения, 'отправитель', @)
										
			.сделать ->
				if options.extra_get?
					return options.extra_get(@.$, environment, @)
				@.done()
				
			.сделать ->
				if ввод.настройки.первый_раз?
					if options.создатель?
						if environment.сообщения_чего?
							return options.создатель(environment.сообщения_чего._id, @.в 'создатель')
				@.done()
	
			.сделать ->
				if options.mark_new?
					return options.mark_new(@.$.сообщения, environment, @)
				@.done()
			
			.сделать ->
				@.$.environment =
					пользователь: пользовательское.поля(['_id'], пользователь)
					сообщения_чего: environment.сообщения_чего
				
				for сообщение in @.$.сообщения
					сообщение._id = сообщение._id.toString()
					
				вывод.send(@.$)
				
	if options.private?
		http.put  '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = db(options.collection).id(ввод.body[options.общение])
			добавляемый = db('people').id(ввод.body.пользователь)
			
			цепь(вывод)
				.сделать ->
					options.добавить_в_общение(_id, добавляемый, пользователь, @)
					
				.сделать (result) ->
					if result.уже_участвует?
						return вывод.send { уже_участвует: yes }
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