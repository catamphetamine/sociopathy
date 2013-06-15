хранилище.create_collection('discussions', [['подписчики', no], ['обновлено_по_порядку', yes], ['id', yes]])
хранилище.create_collection('discussions_messages', [['общение', no]])

эфир.соединения.обсуждение = {}

Уведомления (пользователь, session, новости, tools) ->
	tools.общение('обсуждения')

options =
	id: 'discussions'
	общение: 'обсуждение'
	общение_во_множественном_числе: 'обсуждения'

options.save = (сообщение, environment) ->
	db(options.collection)._.update({ _id: environment.сообщения_чего._id }, { $addToSet: { подписчики: environment.пользователь._id } })

result = messages.messages(options)

result.enable_message_editing('обсуждения')
result.enable_renaming('обсуждения')
result.enable_unsubscription('обсуждения')
result.enable_creation('обсуждение')