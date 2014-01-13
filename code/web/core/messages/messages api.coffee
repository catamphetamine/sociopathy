global.messages_api = (options) ->
	show_from = (environment, возврат) ->
		session = db('people_sessions').get(пользователь: environment.пользователь._id)
		
		return возврат() if not session?
		return возврат(null, options.latest_read(session, environment))
	
	http.get options.data_uri, (ввод, вывод, пользователь) ->
		environment =
			пользователь: пользователь
		
		loading_options =
			collection: options.messages_collection
		
		if options.сообщения_чего?
			сообщения_чего = options.сообщения_чего(ввод)
			environment.сообщения_чего = сообщения_чего
		
		if options.authorize?
			options.authorize(environment)
		
		if not ввод.данные.после?
			if not ввод.данные.с_начала?
				loading_options.с = show_from.do(environment)
		
		loading_options.query = options.these_messages_query({}, environment)

		result = either_way_loading(ввод, loading_options)
		
		$ = {}
		
		$.сообщения = result.data
		$['есть ещё?'] = result['есть ещё?']
		$['есть ли предыдущие?'] = result['есть ли предыдущие?']
		
		пользовательское.подставить.do($.сообщения, 'отправитель')
		
		if ввод.данные.первый_раз?
			if options.extra_get?
				options.extra_get($, environment)
				
			if result.data.пусто()
				$.всего = 0
				$.пропущено = 0
			else
				$.всего = db(options.messages_collection).count(loading_options.query)
			
				сравнение_id = null
				
				if result.sort == 1
					сравнение_id = '$lt'
				else
					сравнение_id = '$gt'
					
				_id_query = {}
				_id_query[сравнение_id] = result.data[0]._id
				
				$.пропущено = db(options.messages_collection).count(Object.x_over_y(loading_options.query, { _id: _id_query }))
			
			if options.создатель?
				if environment.сообщения_чего?
					$.создатель = options.создатель(environment.сообщения_чего._id)
	
		if options.mark_new?
			options.mark_new($.сообщения, environment)
		
		if ввод.данные.первый_раз?
			$.environment =
				пользователь: пользовательское.поля(['_id'], пользователь)
				сообщения_чего: environment.сообщения_чего
				
		for сообщение in $.сообщения
			сообщение._id = сообщение._id.toString()
			
		syntax = ввод.данные.разметка
		device = ввод.данные.device
		view = ввод.данные.view
		
		switch syntax
			when 'html'
				for сообщение in $.сообщения
					markup = Markup.decorate(сообщение.сообщение, { syntax: 'html', tuning: { device: device, view: view } })
							
					messages_style = read_css('markup/messages mobile markup')
		
					html = '<html><head><style>' + Markup_styles.join('\n')  + '\n' + messages_style + '</style></head><body class="markup ' + device + '">' + markup + '</body></html>' 
					
					сообщение.сообщение = html
				
		вывод.send $
				
	if options.private?
		http.put  '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = db(options.collection).id(ввод.данные._id)
			добавляемый = db('people').id(ввод.данные.пользователь)
			
			result = options.добавить_в_общение(_id, добавляемый, пользователь)
			
			if result? && result.уже_участвует?
				return вывод.send { уже_участвует: yes }
			
			вывод.send {}
						
		http.delete '/сеть/' + options.общение_во_множественном_числе + '/участие', (ввод, вывод, пользователь) ->
			_id = ввод.данные._id
			удаляемый = null
			сам_себя = no
			
			if not ввод.данные.пользователь?
				удаляемый = пользователь
				сам_себя = yes
			else
				удаляемый = db('people').id(ввод.данные.пользователь)
			
			db(options.collection).update({ _id: db(options.collection).id(_id) }, { $pull: { участники: удаляемый._id } })
			
			if сам_себя
				set = {}
				set['сам_вышел_из_общений.' + options.path({ сообщения_чего: { _id: _id } })] = yes
				
				db('people_sessions').update({ пользователь: удаляемый._id }, { $set: set })
					
			unset = {}
			unset['последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })] = yes
			
			db('people_sessions').update({ пользователь: удаляемый._id }, { $unset: unset })
			
			уведомления = новости.уведомления(удаляемый)
			
			эфир.отправить('новости', 'уведомления', уведомления)
			вывод.send {}