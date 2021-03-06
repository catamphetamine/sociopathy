http.get '/сеть/пользователь/настройки', (ввод, вывод, пользователь) ->
	пользователь = пользовательское.пользователь_полностью.do(ввод)
			
	session = db('people_sessions').get(пользователь: пользователь._id)
			
	настройки = {}
			
	if (пользователь.почта)
		настройки.почта = пользователь.почта
	
	if пользователь.настройки
		настройки.настройки = пользователь.настройки
		
	if session?
		if session.настройки?
			настройки.язык = session.настройки.язык
		
	#настройки.Клавиши = session.настройки.Клавиши
		
	вывод.send настройки

http.post '/сеть/пользователь/настройки', (ввод, вывод, пользователь) ->
	клавиши = JSON.parse(ввод.данные.клавиши)
	
	пользователь = пользовательское.пользователь_полностью.do(ввод)
			
	почта_изменилась = (пользователь.почта != ввод.данные.почта)
			
	if почта_изменилась
		человек_с_такой_почтой = db('people').get({ почта: ввод.данные.почта, _id: { $ne: пользователь._id } })
		if человек_с_такой_почтой?
			throw 'Вы указали почтовый ящик, уже записанный на другого члена нашей сети'
				
	# проверка на занятость имени не атомарна, но пока так сойдёт
	
	новые_данные_пользователя = {}
	
	if (ввод.данные.почта)
		новые_данные_пользователя.почта = ввод.данные.почта
		
	db('people').update({ _id: пользователь._id }, { $set: новые_данные_пользователя })
	
	настройки = {}
	
	настройки.клавиши = клавиши
		
	if ввод.данные.язык?
		настройки.язык = ввод.данные.язык
	
	db('people_sessions').update({ пользователь: пользователь._id }, { $set: { настройки: настройки } })
	
	if почта_изменилась
		почта.письмо(кому: пользователь.имя + ' <' + пользователь.почта + '>', тема: 'Проверка вашего нового почтового ящика', сообщение: 'Теперь это ваш почтовый ящик в нашей сети')
		
	эфир.отправить("пользователь", "настройки.клавиши", { клавиши: клавиши }, { кому: пользователь._id })
		
	вывод.send {}