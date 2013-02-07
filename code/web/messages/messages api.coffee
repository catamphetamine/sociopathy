global.messages_api = (options) ->
	show_from = (environment, возврат) ->
		session = db('people_sessions')._.find_one({ пользователь: environment.пользователь._id })
		
		return возврат() if not session?
		return возврат(null, options.latest_read(session, environment))
			
	http.get options.data_uri, (ввод, вывод, пользователь) ->
		environment = {}
		environment.пользователь = пользователь
			
		loading_options =
			collection: options.messages_collection
					
		if options.сообщения_чего?
			сообщения_чего = options.сообщения_чего.await(ввод)
			environment.сообщения_чего = сообщения_чего
				
		if options.authorize?
			options.authorize.await(environment)
		
		if not ввод.настройки.после?
			loading_options.с = show_from.await(environment)

		loading_options.query = options.these_messages_query({}, environment)

		result = either_way_loading.await(ввод, loading_options)
		
		$ = {}
				
		$.сообщения = result.data
		$['есть ещё?'] = result['есть ещё?']
		$['есть ли предыдущие?'] = result['есть ли предыдущие?']
		
		пользовательское.подставить.await($.сообщения, 'отправитель')
								
		if options.extra_get?
			options.extra_get.await($, environment)
		
		if ввод.настройки.первый_раз?
			if options.создатель?
				if environment.сообщения_чего?
					$.создатель = options.создатель.await(environment.сообщения_чего._id)
	
		if options.mark_new?
			options.mark_new.await($.сообщения, environment)
		
		$.environment =
			пользователь: пользовательское.поля(['_id'], пользователь)
			сообщения_чего: environment.сообщения_чего
				
		for сообщение in $.сообщения
			сообщение._id = сообщение._id.toString()
			
		вывод.send $
				
	if options.private?
		http.put  '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = db(options.collection).id(ввод.body[options.общение])
			добавляемый = db('people').id(ввод.body.пользователь)
			
			result = options.добавить_в_общение.await(_id, добавляемый, пользователь)
					
			if result? && result.уже_участвует?
				return вывод.send { уже_участвует: yes }
			
			вывод.send {}
						
		http.delete '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = ввод.body._id
			
			db(options.collection)._.update({ _id: db(options.collection).id(_id) }, { $pull: { участники: пользователь._id } })
					
			set_id = 'последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })
			db('people_sessions')._.update({ пользователь: пользователь._id }, { $unset: set_id })
					
			уведомления = новости.уведомления.await(пользователь)
			
			эфир.отправить('новости', 'уведомления', уведомления)
			вывод.send {}