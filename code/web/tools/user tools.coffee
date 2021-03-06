#Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

exports.войти = (пользователь, ввод, вывод, возврат) ->
	if ввод.пользователь?
		if ввод.пользователь._id == пользователь._id
			return возврат(null, пользователь)
				
	ввод.пользователь = { _id: пользователь._id }
	тайный_ключ = пользовательское.тайный_ключ.do(пользователь._id)

	вывод.cookie('user', тайный_ключ, { expires: { toUTCString: -> 'max-age' }, httpOnly: false })
	return возврат(null, пользователь)

exports.выйти = (ввод, вывод) ->
	ввод.session.delete()
	вывод.clearCookie 'user'
	
exports.пользователь = (ввод) ->
	if not ввод.session?
		return
	if not ввод.пользователь?
		return
	return пользовательское.взять.do(ввод.пользователь._id)

exports.пользователь_полностью = (ввод, возврат) ->
	if not ввод.session?
		return возврат(yes)
	if not ввод.пользователь?
		return возврат(yes)
	пользовательское.взять(ввод.пользователь._id, { полностью: yes }, возврат)
			
exports.требуется_вход = (ввод, вывод) ->
	if not ввод.session?
		ошибка = 'Для доступа к адресу «' + decodeURI(ввод.url) + '» требуется вход'
		console.error ошибка
		вывод.send ошибка: ошибка
		return yes
	return no
			
exports.не_он = (_id, ввод, вывод) ->
	return if пользовательское.требуется_вход(ввод, вывод)
	
	if ввод.пользователь._id != _id
		console.log 'Hack attempt: ' + decodeURI(ввод.url)
		console.log 'Hacker: ' + ввод.пользователь._id
		
		ошибка = 'Сделать это может только сам пользователь'
		console.error ошибка
		вывод.send ошибка: ошибка
		return yes
	return no
	
exports.опознать = (тайный_ключ, возврат) ->
	данные = db('people_private_keys').get('тайный ключ': тайный_ключ)
			
	if not данные?
		throw 'пользователь не опознан по ' + тайный_ключ
	
	возврат(null, пользовательское.взять.do(данные.пользователь))

exports.сделать_тайный_ключ = (пользователь) ->
	пользователь._id + '&' + Math.random()
	
exports.тайный_ключ = (_id, возврат) ->
	if typeof _id == 'string'
		_id = db('people').id(_id)
		
	тайный_ключ = db('people_private_keys').get(пользователь: _id)
			
	возврат(null, тайный_ключ['тайный ключ'])

exports.get_session_data = (тайный_ключ, возврат) ->
	session_data = redis_session_store.get.fiberize(redis_session_store)(тайный_ключ)
	возврат(null, session_data)

exports.set_session_data = (тайный_ключ, ключ, значение, возврат) ->
	session_data = redis_session_store.get.fiberize(redis_session_store)(тайный_ключ)
	
	if not session_data?
		session_data = {}
		
	session_data[ключ] = значение
	redis_session_store.set(тайный_ключ, session_data, возврат)
			
exports.приглашение = ->
	снасти.цифры_в_символы(new Date().getTime().toString() + (Math.random()+ '').replace('.', '').substring(0, 5))
		
exports.скрыть = (человек) ->
	скрытые_поля = ['почта', 'пароль', 'когда пришёл']
	if скрытые_поля?
		for поле in скрытые_поля
			delete человек[поле]
		#delete человек['скрытые поля']
	человек
		
exports.взять = (_id, настройки, возврат) ->
	example = null
	options = null
	single = false
	
	if (typeof(настройки) == 'function')
		возврат = настройки
		настройки = {}
		
	if (typeof(_id) == 'object')
		if _id.toHexString?
			example = { _id: _id }
			single = true
		else
			example = _id
			options = настройки.options || {}
			
			if example.id? && typeof(example.id) == 'string'
				single = true
			else if example['имя']? && typeof(example['имя']) == 'string'
				single = true
	else if (typeof(_id) == 'string')
		example = { _id: db('people').id(_id) }
		single = true
		
	result = null
	
	if single
		result = db('people').get(example)
	else
		result = db('people').get(example, options)
	
	if not result?
		return возврат()
		
	if not настройки.полностью?
		if single
			пользовательское.скрыть(result)
		else
			for человек in result
				пользовательское.скрыть(человек)
				
	возврат(null, result)
			
exports.подставить = (куда, переменная, возврат) ->
	_ids = []
	
	if куда instanceof Array
		for куда_подставить in куда
			if куда_подставить[переменная]?
				if куда_подставить[переменная] instanceof Array
					for _id in куда_подставить[переменная]
						if not _ids.has(_id)
							_ids.put(_id)
				else
					_id = куда_подставить[переменная]
					if not _ids.has(_id)
						_ids.put(_id)
	else
		if куда[переменная]?
			_ids.put(куда[переменная])

	пользователи = []
	for _id in _ids
		пользователи.add(пользовательское.взять.do(_id))

	users = {}
	for пользователь in пользователи
		users[пользователь._id + ''] = пользователь
	
	пользователи = users
	
	if куда instanceof Array
		for куда_подставить in куда
			if куда_подставить[переменная]?
				if куда_подставить[переменная] instanceof Array
					куда_подставить[переменная].forEach (_id, индекс) ->
						куда_подставить[переменная][индекс] = пользовательское.поля(пользователи[_id + ''])
				else
					куда_подставить[переменная] = пользовательское.поля(пользователи[куда_подставить[переменная] + ''])
	else
		if куда[переменная]?
			куда[переменная] = пользовательское.поля(пользователи[куда[переменная] + ''])
	
	возврат(null, куда)
			
exports.поля = (поля, пользователь) ->
	поля_по_умолчанию = ['имя', 'id', 'пол', 'avatar_version']
		
	if not (поля instanceof Array)
		пользователь = поля
		поля = поля_по_умолчанию
	else if поля[0] == '...'
		поля.shift()
		поля = поля_по_умолчанию.concat(поля)
		
	выбранное = Object.выбрать(поля, пользователь)
	выбранное._id = пользователь._id.toString()
	выбранное
	
есть_ли_полномочия = (какие, пользователь) ->
	if not пользователь.полномочия?
		return false

	if пользователь.полномочия.has('управляющий')
		return true

	if пользователь.полномочия.has(какие)
		return true
	
	return false

exports.проверить_полномочия = (какие, пользователь) ->
	if not есть_ли_полномочия(какие, пользователь)
		throw "Недостаточно полномочий: " + какие
	
exports.пользователь_ли = (ввод) ->
	if ввод.session?
		return yes
	
	if ввод.cookies.user?
		return yes
		
	return false
	
exports.данные_пользователя = (ввод, вывод) ->
	if not ввод.session?
		if ввод.cookies.user?
			вывод.clearCookie 'user'
			throw 'user.invalid authentication token'
		else
			throw 'user.not authenticated'

	пользователь = db('people').get(ввод.пользователь._id)
	session = db('people_sessions').get(пользователь: пользователь._id)
	
	$ = {}
		
	$.session =
		настройки: session.настройки
		не_показывать_подсказки: session.не_показывать_подсказки
	
	$.пользователь = пользовательское.поля(['...', 'язык', 'photo_version', 'полномочия'], пользователь)
		
	$.пользователь.беседы = {}
	$.пользователь.обсуждения = {}
	$.пользователь.новости = {}
	
	return $

exports.session = (пользователь) ->
	# if http input
	if пользователь.httpVersion?
		пользователь = пользователь.пользователь._id
		
	_id = пользователь
	if пользователь._id?
		_id = пользователь._id
		
	return db('people_sessions').get(пользователь: _id)

exports.создать = (человек) ->
	
	человек['когда пришёл'] = new Date()
	
	проверка = (id) ->
		found = db('people').get(id: id)
		return not found?
	
	человек.id = снасти.generate_unique_id(человек.имя, проверка)
			
	пользователь = db('people').add(человек)

	тайный_ключ = пользовательское.сделать_тайный_ключ(пользователь)
	
	db('people_private_keys').add({ пользователь: пользователь._id, 'тайный ключ': тайный_ключ })

	db('circles').add({ пользователь: пользователь._id, круг: 'Основной', члены: [] })

	db('people_sessions').add({ пользователь: пользователь._id })

	db('news').add({ что: 'прописка', пользователь: пользователь._id, когда: new Date() })
	
	return пользователь

###
exports.в_сети_ли = (_id, возврат) ->
	if typeof _id == 'string'
		_id = db('people').id(_id)
		
	session = db('people_sessions').get({ пользователь: _id })
	if not session.online?
		return возврат(null, no)
	возврат(null, session.online)
###