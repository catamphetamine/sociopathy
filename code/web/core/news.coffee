api = {}
		
уведомления = []
			
global.Уведомления = (gather_notifications) ->
	уведомления.add(gather_notifications)
			
api.уведомления = (пользователь) ->
	session = пользовательское.session(пользователь)

	новости = {}

	tools = {}

	tools.общение = (общение_во_множественном_числе) ->
		новости[общение_во_множественном_числе] = {}
			
		if not session.последние_сообщения?	
			return
		
		mark = (_id, сообщение) ->
			новости[общение_во_множественном_числе][_id] = сообщение

		if session.последние_сообщения[общение_во_множественном_числе]?
			for _id, сообщение of session.последние_сообщения[общение_во_множественном_числе]
				последние_прочитанные = session.последние_прочитанные_сообщения[общение_во_множественном_числе]
				if последние_прочитанные?
					if последние_прочитанные[_id]?
						if последние_прочитанные[_id] < сообщение
							mark(_id, сообщение)
				else
					mark(_id, сообщение)
					
	for notifications in уведомления
		notifications(пользователь, session, новости, tools)

	return новости

global.новости = api