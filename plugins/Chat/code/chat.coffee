Уведомления (пользователь, session, новости) ->
	chat_info = db('chat_info')._.find_one()

	общение = 'болталка'
	
	mark = (сообщение) ->
		новости[общение] = сообщение
			
	if chat_info.последнее_сообщение?
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