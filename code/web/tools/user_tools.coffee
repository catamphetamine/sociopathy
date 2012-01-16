Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

exports.войти = (пользователь, ввод, вывод, возврат) ->
	if ввод.session?
		if ввод.session.пользователь?
			if ввод.session.пользователь._id == пользователь._id
				return
		ввод.session.пользователь = пользователь
		return возврат null, пользователь
		
	цепь(вывод)
		.сделать ->
			пользовательское.тайный_ключ(пользователь._id, @)
			
		.сделать (тайный_ключ) ->
			вывод.cookie 'user', тайный_ключ, { expires: Cookie_expiration_date, httpOnly: false }
			возврат null, пользователь
	
exports.выйти = (ввод, вывод) ->
	ввод.session.destroy()
	вывод.clearCookie 'user'

exports.получить_пользователя = (номер_пользователя, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			хранилище.collection('people').findOne({ _id: номер_пользователя }, @)
			
		.сделать (пользователь) ->
			if not пользователь?
				throw "пользователь #{номер_пользователя} не найден"
			@.done(пользователь)
			
exports.требуется_вход = (ввод, вывод) ->
	if not ввод.session?
		ошибка = 'Для доступа к адресу «' + decodeURI(ввод.url) + '» требуется вход'
		console.error ошибка
		вывод.send ошибка: ошибка
		return yes
	return no
	
exports.выбрать_поля = (поля, пользователь) ->
	данные = {}
	поля.forEach (поле) ->
		if пользователь[поле]?
			данные[поле] = пользователь[поле]
	данные
	
exports.опознать = (тайный_ключ, возврат) ->
	new Цепочка(возврат)
		.сделать ->
			хранилище.collection('people_private_keys').findOne({ 'тайный ключ': тайный_ключ }, @)
			
		.сделать (данные) ->
			if not данные?
				throw 'пользователь не опознан по ' + тайный_ключ
			пользовательское.получить_пользователя(данные.пользователь, @)
		
		.сделать (пользователь) ->	
			@.done(пользователь)
	
exports.тайный_ключ = (id, возврат) ->
	if typeof id == 'string'
		id = хранилище.collection('people').id(id)
	new Цепочка(возврат)
		.сделать ->
			хранилище.collection('people_private_keys').find({ пользователь: id }).toArray @
		.сделать (тайный_ключ) ->
			#if тайный_ключ?
			#	тайный_ключ = тайный_ключ['тайный ключ']
			@.done(тайный_ключ[0]['тайный ключ'])

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