http.get '/сеть/беседы', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'talks', query: {} }, @.в 'беседы')
			
		.сделать ->
			пользовательское.подставить(@.$.беседы, 'участники', @)
			
		.сделать ->
			вывод.send @.$
			
options =
	id: 'talks'
	uri: '/беседа'
	data_uri: '/сеть/беседа/сообщения'
	
options.in_ether_id = 'беседы'

options.сообщения_чего = (ввод, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			if ввод.настройки._id?
				return db('talks').findOne({ _id: ввод.настройки._id }, @)
			db('talks').findOne({ id: ввод.настройки.id }, @)
			
		.сделать (сообщения_чего) ->
			@.done(Object.выбрать(['_id', 'название'], сообщения_чего))
			
options.сообщения_чего_from_string = (сообщения_чего) ->
	if сообщения_чего._id.toHexString?
		return сообщения_чего
	сообщения_чего._id = db('talks').id(сообщения_чего._id)
	return сообщения_чего
			
options.messages_collection_id = 'messages'

options.messages_query = (collection, environment) ->
	if environment.сообщения_чего._id.toHexString?
		return { общение: environment.сообщения_чего._id }
	{ общение: collection.id(environment.сообщения_чего._id) }

options.extra_get = (data, environment, возврат) ->
	data.название = environment.сообщения_чего.название
	data._id = environment.сообщения_чего._id
	возврат()

options.latest_read_message = (environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('people_sessions').findOne({ пользователь: environment.пользователь._id }, @)
			
		.сделать (session) ->
			return @.done() if not session?
			return @.done() if not session.последние_прочитанные_сообщения?
			return @.done() if not session.последние_прочитанные_сообщения.беседы?
			@.done(session.последние_прочитанные_сообщения.беседы[environment.сообщения_чего._id])
			
options.notify = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			set_id = 'новости.беседы.' + environment.сообщения_чего._id.toString()
			db('people_sessions').update({ пользователь: { $ne: environment.пользователь._id } }, { $addToSet: { set_id: _id.toString() } }, @)
			
		.сделать ->	
			эфир.отправить('новости', 'беседы', { _id: environment.сообщения_чего._id.toString(), сообщение: _id.toString() }, { кроме: environment.пользователь._id })
			for пользователь in эфир.пользователи()
				if пользователь != environment.пользователь._id + ''
					соединение_с_беседой = эфир.соединение_с('беседы', { пользователь: environment.пользователь._id, _id: environment.сообщения_чего._id.toString() })
					if not соединение_с_беседой
						эфир.отправить_одному_соединению('новости', 'звуковое оповещение', { чего: 'беседы' }, { пользователь: пользователь })
			@.done()

options.message_read = (_id, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			actions = { $set: {} }
			actions.$set["последние_прочитанные_сообщения.беседы." + environment.сообщения_чего._id] = _id
			db('people_sessions').update({ пользователь: environment.пользователь._id }, actions, @)
			
		.сделать ->
			set_id = 'новости.беседы.' + environment.сообщения_чего._id.toString()
			db('people_sessions').update({ пользователь: environment.пользователь._id }, { $pull: { set_id: _id.toString() } }, @)

options.save = (сообщение, environment, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			db('messages').save({ отправитель: environment.пользователь._id, сообщение: сообщение, когда: new Date(), общение: environment.сообщения_чего._id }, @._.в 'сообщение')
	
		.сделать ->
			db('talks').update({ _id: environment.сообщения_чего._id }, { $addToSet: { подписчики: environment.пользователь._id } }, @)
			
		.сделать ->
			@.done(@._.сообщение)
	
messages.messages(options)

http.delete '/сеть/беседы/подписка', (ввод, вывод, пользователь) ->
	_id = ввод.body._id
	
	цепь(вывод)
		.сделать ->
			db('talks').update({ _id: db('talks').id(_id) }, { $pull: { подписчики: пользователь._id } }, @)
			
		.сделать ->
			set_id = 'новости.беседы.' + _id
			db('people_sessions').update({ пользователь: environment.пользователь._id }, { $unset: set_id }, @)
			
		.сделать ->
			новости.уведомления(пользователь, @)
			
		.сделать (уведомления) ->
			эфир.отправить('новости', 'обновить', уведомления)
			вывод.send {}