Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

exports.войти = (пользователь, ввод, вывод, возврат) ->
	if ввод.session?
		if ввод.session.пользователь?
			if ввод.session.пользователь._id == пользователь._id
				return
		ввод.session.пользователь = { _id: пользователь._id }
		return возврат(null, пользователь)
		
	цепь(вывод)
		.сделать ->
			пользовательское.тайный_ключ(пользователь._id, @)
			
		.сделать (тайный_ключ) ->
			вывод.cookie('user', тайный_ключ, { expires: Cookie_expiration_date, httpOnly: false })
			возврат(null, пользователь)
	
exports.выйти = (ввод, вывод) ->
	ввод.session.destroy()
	вывод.clearCookie 'user'
	
exports.пользователь = (ввод, возврат) ->
	if not ввод.session?
		return возврат()
	if not ввод.session.пользователь?
		return возврат()
	пользовательское.взять(ввод.session.пользователь._id, возврат)

exports.пользователь_полностью = (ввод, возврат) ->
	if not ввод.session?
		return возврат()
	if not ввод.session.пользователь?
		return возврат()
	пользовательское.взять(ввод.session.пользователь._id, { полностью: yes }, возврат)
			
exports.требуется_вход = (ввод, вывод) ->
	if not ввод.session?
		ошибка = 'Для доступа к адресу «' + decodeURI(ввод.url) + '» требуется вход'
		console.error ошибка
		вывод.send ошибка: ошибка
		return yes
	return no
			
exports.не_он = (_id, ввод, вывод) ->
	return if пользовательское.требуется_вход(ввод, вывод)
	
	if ввод.session.пользователь._id != _id
		console.log 'Hack attempt: ' + decodeURI(ввод.url)
		console.log 'Hacker: ' + ввод.session.пользователь._id
		
		ошибка = 'Сделать это может только сам пользователь'
		console.error ошибка
		вывод.send ошибка: ошибка
		return yes
	return no
	
exports.опознать = (тайный_ключ, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			хранилище.collection('people_private_keys').findOne({ 'тайный ключ': тайный_ключ }, @)
			
		.сделать (данные) ->
			if not данные?
				throw 'пользователь не опознан по ' + тайный_ключ
			пользовательское.взять(данные.пользователь, @)
		
		.сделать (пользователь) ->	
			@.done(пользователь)

exports.сделать_тайный_ключ = (пользователь) ->
	пользователь._id + '&' + Math.random()
	
exports.тайный_ключ = (_id, возврат) ->
	if typeof _id == 'string'
		_id = хранилище.collection('people').id(_id)
	new Цепочка(возврат)
		.сделать ->
			хранилище.collection('people_private_keys').findOne({ пользователь: _id }, @)
		.сделать (тайный_ключ) ->
			@.done(тайный_ключ['тайный ключ'])

exports.get_session_data = (тайный_ключ, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			redis_session_store.get(тайный_ключ, @)
		.сделать (session_data) ->
			возврат(null, session_data)

exports.set_session_data = (тайный_ключ, ключ, значение, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			redis_session_store.get(тайный_ключ, @)
		.сделать (session_data) ->
			if not session_data?
				session_data = {}
			session_data[ключ] = значение
			redis_session_store.set(тайный_ключ, session_data, возврат)
			
exports.приглашение = ->
	new Date().getTime().toString() + '@' + Math.random()
	
exports.создать = (человек, возврат) ->
	человек['скрытые поля'] = ['почта', 'пароль', 'когда пришёл']
	хранилище.collection('people').save(человек, возврат)
	
exports.скрыть = (человек) ->
	if человек['скрытые поля']?
		for поле in человек['скрытые поля']
			delete человек[поле]
		delete человек['скрытые поля']
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
			
			if example['адресное имя']? && typeof(example['адресное имя']) == 'string'
				single = true
			else if example['имя']? && typeof(example['имя']) == 'string'
				single = true		
	else if (typeof(_id) == 'string')
		example = { _id: хранилище.collection('people').id(_id) }
		single = true
		
	new Цепочка(возврат)
		.сделать ->
			if single
				хранилище.collection('people').findOne(example, @)
			else
				хранилище.collection('people').find(example, options).toArray(@)
		.сделать (result) ->
			if not настройки.полностью?
				if single
					пользовательское.скрыть(result)
				else
					for человек in result
						пользовательское.скрыть(человек)
			@.done(result)