options =
	id: 'talks'
	общение: 'беседа'
	общение_во_множественном_числе: 'беседы'

options.общения_query = (пользователь) -> { участники: пользователь._id }
	
options.private = yes

options.сообщения_чего_extra = (result, сообщения_чего) ->
	result.участники = сообщения_чего.участники.map((x) -> x.toString())
					
options.save = (сообщение, environment) ->
	db(options.collection)._.update({ _id: environment.сообщения_чего._id }, { $pull: { участники: environment.пользователь._id } })
	db(options.collection)._.update({ _id: environment.сообщения_чего._id }, { $addToSet: { участники: environment.пользователь._id } })	

#options.bulk_get_extra = (беседы) ->
#	пользовательское.подставить.await(беседы, 'участники')

result = messages.messages(options)

result.enable_message_editing('беседы')
result.enable_renaming('беседы')

append = (data, environment) ->
	data.участники = [environment.пользователь._id]
	data.создана = data.создано
	delete data.создано

result.enable_creation('беседа', append)

#result.enable_unsubscription('беседы')