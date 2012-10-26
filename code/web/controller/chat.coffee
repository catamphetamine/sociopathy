options =
	id: 'chat'
	общение: 'болталка'

options.правка_сообщения_чего = 'болталки'
	
result = messages.messages(options)
result.enable_message_editing('болталка', { update: (_id, отправитель, content, возврат) -> db('chat').update({ _id: db('chat').id(_id), отправитель: отправитель }, $set: { сообщение: content }, возврат) })