options =
	id: 'discussions'
	общение: 'обсуждение'
	общение_во_множественном_числе: 'обсуждения'

options.save = (сообщение, environment, возврат) ->
	цепь(возврат)
		.сделать ->
			db(options.collection).update({ _id: environment.сообщения_чего._id }, { $addToSet: { подписчики: environment.пользователь._id } }, @)

result = messages.messages(options)

result.enable_message_editing('обсуждения')
result.enable_renaming('обсуждения')
result.enable_unsubscription('обсуждения')
result.enable_creation('обсуждение')