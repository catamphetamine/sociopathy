if not хранилище.collection('chat_info').exists()
	хранилище.create_collection('chat_info')
	db('chat_info')._.save({})
	
	хранилище.create_collection('chat', [['отправитель', no]])
	#db('chat')._.save({ отправитель: человек._id, сообщение: 'Здравствуйте', когда: new Date() })

Уведомления (пользователь, session, новости) ->
	chat_info = db('chat_info')._.find_one()

	общение = 'болталка'
	
	mark = (сообщение) ->
		новости[общение] = сообщение
			
	if chat_info.последнее_сообщение?
		if not session.последние_прочитанные_сообщения?
			return
		
		последнее_прочитанное = session.последние_прочитанные_сообщения[общение]
		последнее_сообщение = chat_info.последнее_сообщение
		if последнее_прочитанное?
			if последнее_прочитанное < последнее_сообщение
				mark(последнее_сообщение)
		else if последнее_сообщение?
			mark(последнее_сообщение)
					
options =
	id: 'chat'
	общение: 'болталка'

result = messages.messages(options)

result.enable_message_editing('болталка', { update: (_id, отправитель, content, возврат) -> db('chat').update({ _id: db('chat').id(_id), отправитель: отправитель }, $set: { сообщение: content }, возврат) })