http.get '/сеть/беседы', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'talks', query: { участники: пользователь._id }, parameters: { sort: [['обновлено', -1]] } }, @.в 'беседы')
			
		.сделать ->
			пользовательское.подставить(@.$.беседы, 'участники', @)
			
		.сделать ->
			@.done(@.$.беседы)
			
		.все_вместе (беседа) ->
			db('messages').find({ общение: беседа._id, чего: 'беседы' }, { sort: [['_id', -1]], limit: 1 }).toArray(@)
			
		.сделать (последние_сообщения) ->
			сообщения = []
			for array in последние_сообщения
				if not array.пусто()
					сообщения.push(array[0])
			
			последние_сообщения = сообщения
			пользовательское.подставить(последние_сообщения, 'отправитель', @)
			
		.сделать (последние_сообщения) ->
			последние_сообщения.merge_into(@.$.беседы, 'последнее_сообщение', (беседа) -> @.общение + '' == беседа._id + '')
			
		#.сделать ->
			вывод.send @.$
			
options =
	id: 'talks'
	общение: 'беседа'
	общение_во_множественном_числе: 'беседы'
	
options.правка_сообщения_чего = 'беседы'
		
options.messages_query = { чего: 'беседы' }

options.сообщения_чего = (result, сообщения_чего) ->
	result.участники = сообщения_чего.участники.map((x) -> x.toString())
			
options.messages_collection_id = 'messages'

options.messages_query = (environment) ->
	query = {}
	query.чего = 'беседы'
	if environment.сообщения_чего._id.toHexString?
		query.общение = environment.сообщения_чего._id
	else
		query.общение = collection.id(environment.сообщения_чего._id)
	query

options.extra_get = (data, environment) ->
	data.участники = environment.сообщения_чего.участники

options.authorize = (environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db('talks').findOne({ _id: environment.сообщения_чего._id }, @)
			
		.сделать (беседа) ->
			if not беседа.участники?
				throw { error: 'Вы не участвуете в этой беседе', display_this_error: yes }
			
			if not беседа.участники.map((_id) -> _id + '').has(environment.пользователь._id + '')
				throw { error: 'Вы не участвуете в этой беседе', display_this_error: yes }
			
			@.done()

options.notified_users = (беседа) -> беседа.участники
					
result = messages.messages(options)
result.enable_message_editing('беседы')
result.enable_renaming('беседы')

append = (data, environment) ->
	data.участники = [environment.пользователь._id]
	data.создана = data.создано
	delete data.создано

result.enable_creation('беседа', append)

#result.enable_unsubscription('беседы')

http.delete '/сеть/' + 'беседы' + '/участие', (ввод, вывод, пользователь) ->
	_id = ввод.body._id
	
	цепь(вывод)
		.сделать ->
			db(options.id).update({ _id: db(options.id).id(_id) }, { $pull: { участники: пользователь._id } }, @)
			
		.сделать ->
			set_id = 'последние_сообщения.' + options.path({ сообщения_чего: { _id: _id } })
			db('people_sessions').update({ пользователь: пользователь._id }, { $unset: set_id }, @)
			
		.сделать ->
			новости.уведомления(пользователь, @)
			
		.сделать (уведомления) ->
			эфир.отправить('новости', 'уведомления', уведомления)
			вывод.send {}
		
добавить_в_беседу = (_id, добавляемый, пользователь, возврат) ->
	цепь(возврат)
		.сделать ->
			db(options.id).findOne({ _id: _id }, @)
			
		.сделать (беседа) ->
			нет_прав = yes
		
			if беседа.участники?
				for участник in беседа.участники
					if участник + '' == добавляемый + ''
						return вывод.send({ уже_участвует: yes })
					if участник + '' == пользователь._id + ''
						нет_прав = no
						
			if нет_прав
				return вывод.send(ошибка: "Вы не участник этой беседы, и поэтому \n не можете добавлять в неё людей")

			db(options.id).update({ _id: _id }, { $addToSet: { участники: добавляемый } }, @)
			
		.сделать ->
			db('people_sessions').findOne({ пользователь: добавляемый }, @)
			
		.сделать (session) ->
			query = { чего: 'беседы', общение: _id }
			
			latest_read = options.latest_read(session, { сообщения_чего: { _id: _id } })
			if latest_read?
				query._id = { $gt: latest_read }
				
			db('messages').find(query).toArray(@)
			
		.сделать (unread_messages) ->
			unread_message_ids = unread_messages.map((message) -> message._id.toString())
			
			эфир.отправить('новости', 'беседы', { _id: _id.toString(), сообщения: unread_message_ids }, { кому: добавляемый })
			
			set_id = 'новости.' + options.in_session_id + '.' + _id
			
			set_operation = {}
			set_operation[set_id] = { $each: unread_message_ids }
			
			db('people_sessions').update({ пользователь: добавляемый }, { $addToSet: set_operation }, @)
			
options.creation_extra = (_id, пользователь, ввод, возврат) ->
	кому = ввод.body.кому
	
	if not кому?
		return возврат()
	
	добавить_в_беседу(_id, db('people').id(кому), пользователь, возврат)
	
http.put  '/сеть/' + 'беседы' + '/участие', (ввод, вывод, пользователь) ->
	_id = db(options.id).id(ввод.body.беседа)
	добавляемый = db('people').id(ввод.body.пользователь)
	
	цепь(вывод)
		.сделать ->
			добавить_в_беседу(_id, добавляемый, пользователь, @)
			
		.сделать ->
			вывод.send {}