#хранилище.bind 'people',
#	выбрать: (настройки, возврат) ->
#		условия = настройки.условия || {}
#		@find(условия, { skip: настройки.с - 1, limit: настройки.сколько }).toArray возврат

http.get '/люди/найти', (ввод, вывод) ->
	люди = db('people').find({ имя: { $regex: '.*' + RegExp.escape(ввод.данные.query) + '.*', $options: 'i' } }, { limit: ввод.данные.max })
	вывод.send(люди: люди)
			
http.get '/люди', (ввод, вывод) ->
	options =
		collection: 'people'
		query: {},
		total: yes
		
	result = either_way_loading(ввод, options)
	
	for человек in result.data
		пользовательское.скрыть(человек)
		session = db('people_sessions').get(пользователь: человек._id)
		человек['когда был здесь'] = session['когда был здесь']
		
	ответ = 
		люди: result.data
		'есть ещё?': result['есть ещё?']
		'есть ли предыдущие?': result['есть ли предыдущие?']
		всего: result.всего
	
	вывод.send(ответ)

http.get '/человек', (ввод, вывод) ->
	пользователь = null

	if ввод.данные.id?
		пользователь = пользовательское.взять.do({ id: ввод.данные.id })
	else
		пользователь = пользовательское.взять.do(ввод.данные._id)

	if not пользователь?
		ошибка =
			key: 'user not found'
			текст: "Пользователь «#{ввод.данные.id}» не состоит в нашей сети"
			уровень: 'ничего страшного'
			показать: no
			
		throw ошибка
			
	$ = {}
			
	for key, value of пользователь
		$[key] = value

	if not ввод.данные.подробно?
		return вывод.send $
		
	session = db('people_sessions').get(пользователь: $._id)
	$['когда был здесь'] = session['когда был здесь']
	
	картинки = db('picture_albums').find({ пользователь: $._id }, { limit: 1 })
	$['есть ли картинки?'] = !картинки.пусто()
			
	видеозаписи = db('video_albums').find({ пользователь: $._id }, { limit: 1 })
	$['есть ли видеозаписи?'] = !видеозаписи.пусто()
			
	книги = db('peoples_books').get(пользователь: $._id)
	if книги? && !книги.книги.пусто()
		$['есть ли книги?'] = yes
			
	#.сделать ->
	#	db('diaries').find({ пользователь: @.$._id }, { limit: 1}).toArray(@)
		
	#.сделать (diaries) ->
	#	@.$['ведёт ли дневник?'] = !diaries.пусто()
		
	#.сделать ->
	#	db('journals').find({ пользователь: @.$._id }, { limit: 1}).toArray(@)
		
	#.сделать (journals) ->
	#	@.$['ведёт ли журнал?'] = !journals.пусто()

	текущий_пользователь = пользовательское.пользователь(ввод)

	if текущий_пользователь?
		круги = db('circles').find({ пользователь: текущий_пользователь._id })
		
		for круг in круги
			for член in круг.члены
				if член + '' == $._id + ''
					$.в_круге = круг
					break

	вывод.send $
			
http.get '/сеть/черновик', (ввод, вывод) ->
	#console.log(ввод.данные.что)
	вывод.send({})
			
http.get '/человек/по имени', (ввод, вывод) ->
	человек = db('people').get(имя: ввод.данные.имя)
	
	if not человек?
		return вывод.send(ошибка: 'Пользователь не найден', не_найден: yes)
	
	вывод.send(пользовательское.поля(человек))
			
http.get '/человек/по почте', (ввод, вывод) ->
	человек = db('people').get(почта: ввод.данные.почта)
	
	if not человек?
		return вывод.send(ошибка: 'Пользователь не найден', не_найден: yes)
	
	вывод.send(пользовательское.поля(человек))
	
http.get '/люди/поиск', (ввод, вывод) ->
	шаблон = '.*' + RegExp.escape(ввод.данные.query) + '.*'
	
	люди = db('people').find({ имя: { $regex: шаблон, $options: 'i' } }, { limit: ввод.данные.max })
	
	Object.выбрать(['_id', 'id', 'имя', 'avatar_version'], люди)
		
	вывод.send(люди: люди)