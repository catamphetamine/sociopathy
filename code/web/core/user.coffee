# защита от перебора пароля:
#
# когда вход, проверяют "предыдущую неудавшуюся попытку входа"
# если она меньше, чем за час до текущей - ставить "температуру" в 2 раза больше (2, если ноль), и прописывать уже эту дату попытки входа
# если температура больше 1000 - не давать входить.
# каждые 15 минут температура остывает в 2 раза
http.post '/вход', (ввод, вывод) ->
	The_hottest_allowed_temperature = 1000
	Temperature_half_life = 15 # minutes
	Temperature_doubles_when_in_interval = 60 # minutes
	
	пользователь = пользовательское.взять.await({ имя: ввод.данные.имя }, { полностью: yes })

	if not пользователь?
		throw 'Такого пользователя нет в нашей сети'
		
	session = db('people_sessions')._.find_one({ пользователь: пользователь._id })
			
	# насколько успело остыть - настолько остудить
	температура = 0
	if session.последний_неудавшийся_вход?
		температура = session.последний_неудавшийся_вход.температура
		когда = session.последний_неудавшийся_вход.когда
		сейчас = new Date()
				
		while когда.add(Temperature_half_life).minutes().isBefore(сейчас)
			температура /= 2
			когда = когда.add(Temperature_half_life).minutes()
			if температура < 1
				температура = 0
				delete session.последний_неудавшийся_вход
				break
			
	if пользователь.пароль != ввод.данные.пароль
		не_вошёл = yes
		if температура < The_hottest_allowed_temperature
			if session.последний_неудавшийся_вход?
				if session.последний_неудавшийся_вход.когда.add(Temperature_doubles_when_in_interval).minutes().isAfter(new Date())
						температура *= 2
			else
				температура = 2
				
			db('people_sessions')._.update({ пользователь: @._.пользователь._id }, { $set: { последний_неудавшийся_вход: { когда: new Date(), температура: температура } } })
	
	if температура >= The_hottest_allowed_temperature
		throw 'Возможно вы пытаетесь взломать пароль. Попробуйте позже.'
		
	if не_вошёл?
		throw 'Неверный пароль'
	
	db('people_sessions')._.update({ пользователь: пользователь._id }, { $unset: { последний_неудавшийся_вход: yes } })
	
	пользовательское.войти.await(пользователь, ввод, вывод)

	вывод.send(пользователь: пользовательское.поля(пользователь))

http.post '/выход', (ввод, вывод) ->
	пользовательское.выйти ввод, вывод
	вывод.send {}
	
http.put '/прописать', (ввод, вывод) ->
	if Options.Invites
		query =
			ключ: ввод.данные.приглашение,
			использовано:  { $exists : no } 
				
		update = { $set: { использовано: yes } }
		
		collection = db('invites')
		invite = collection.findAndModify.bind_await(collection)(query, [], update, {})
	
		if not invite?
			throw 'No invite given'
	
	пользователь = пользовательское.создать(ввод.данные)
	
	вывод.send(ключ: пользователь._id)

http.get '/приглашение/проверить', (ввод, вывод) ->
	приглашение = db('invites')._.find_one {ключ: ввод.данные.приглашение.toString() }
		
	if not приглашение?
		throw 'Нет такого приглашения в списке'
		
	if приглашение.использовано
		throw 'Это приглашение уже использовано'
		
	вывод.send приглашение: приглашение

http.put '/сеть/человек/данные', (ввод, вывод, пользователь) ->
	if ввод.данные.имя != пользователь.имя
		человек_с_таким_именем = db('people')._.find_one({ имя: ввод.данные.имя, _id: { $ne: пользователь._id } })
		if человек_с_таким_именем?
			show_error('Такое имя уже занято')
		
	# проверка на занятость имени не атомарна, но пока так сойдёт
	db('people')._.update({ _id: пользователь._id }, { $set: { имя: ввод.данные.имя, описание: ввод.данные.описание, откуда: ввод.данные.откуда, 'о себе': JSON.parse(ввод.данные.о_себе) } })
	
	вывод.send {}
	
	if (ввод.данные.имя != пользователь.имя)
		эфир.отправить('пользователь', 'смена имени', ввод.данные.имя, { кому: пользователь._id })
			
http.put '/сеть/человек/картинка', (ввод, вывод, пользователь) ->
	options =
		временное_название: ввод.данные.имя
		место: '/люди/' + пользователь.id.to_unix_file_name() + '/картинка'
		название: 'большая'
		extra_sizes: { 'маленькая': { размер: Options.User.Picture.Chat.Size } }
	
	finish_picture_upload(options)
			
	db('people')._.update({ _id: пользователь._id }, { $inc: { 'avatar_version': 1 } })
			
	пользователь = db('people')._.find_one({ _id: пользователь._id })
	эфир.отправить('пользователь', 'аватар обновлён', { version: пользователь.avatar_version, пользователь: пользователь.id }, { кому: пользователь._id })
	
	вывод.send {}

http.put '/сеть/человек/фотография', (ввод, вывод, пользователь) ->
	options = 
		временное_название: ввод.данные.имя
		место: '/люди/' + пользователь.id.to_unix_file_name()
		название: 'фотография'
		
	finish_picture_upload(options)
	
	db('people')._.update({ _id: пользователь._id }, { $inc: { 'photo_version': 1 } })
	вывод.send {}

http.get '/сеть/мусорка/личная', (ввод, вывод, пользователь) ->
	содержимое = db('trash')._.find({ пользователь: пользователь._id })
	вывод.send(содержимое: содержимое)
			
http.delete '/сеть/подсказка', (ввод, вывод, пользователь) ->
	db('people_sessions')._.update({ пользователь: пользователь._id }, { $addToSet: { 'не_показывать_подсказки': ввод.данные.подсказка } })			
	эфир.отправить("пользователь", "не_показывать_подсказку", { подсказка: ввод.данные.подсказка }, { кому: пользователь._id })
	вывод.send {}
			
http.get '/сеть/черновик', (ввод, вывод, пользователь) ->
	что = ввод.данные.что

	query = null
	
	if что == 'заметка'
		query = { заметка: ввод.данные.заметка }
	else
		query = { что: что }
		
	черновик = db('drafts')._.find_one(Object.x_over_y({ пользователь: пользователь._id }, query))
	
	if not черновик?
		return вывод.send({})
	
	вывод.send(черновик: черновик.данные)
			
http.put '/сеть/черновик', (ввод, вывод, пользователь) ->
	что = ввод.данные.что
	данные = ввод.данные.данные
	
	query = null
	
	if что == 'заметка'
		query = { заметка: ввод.данные.заметка }
	else
		query = { что: что }
				
	db('drafts')._.update(Object.x_over_y({ пользователь: пользователь._id }, query), { $set: { данные: данные } })
	вывод.send({})
			
http.get '/сеть/пароль', (ввод, вывод, пользователь) ->
	db('people')._.update({ _id: пользователь._id, пароль: '123' }, { $set: { пароль: ввод.данные.пароль } })
	вывод.send({})

http.put '/сеть/пользователь/язык', (ввод, вывод, пользователь) ->
	db('people')._.update({ _id: пользователь._id }, { $set: { язык: ввод.данные.язык } })
	вывод.send({})