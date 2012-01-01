Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

exports.войти = (пользователь, ввод, вывод, возврат) ->
	if ввод.session?
		if ввод.session.data.пользователь?
			if ввод.session.data.пользователь._id == пользователь._id
				return
		ввод.session.data.пользователь = пользователь
	else
		вывод.cookie 'user', пользователь._id, { expires: Cookie_expiration_date, httpOnly: false }
		
	возврат null, пользователь
	
exports.выйти = (ввод, вывод) ->
	ввод.session.destroy()
	вывод.clearCookie 'user'

exports.получить_пользователя = (номер_пользователя, вывод, возврат) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findById номер_пользователя, @
			
		.сделать (пользователь) ->
			if not пользователь?
				return возврат false
			возврат null, пользователь
			
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
		данные[поле] = пользователь[поле]
	данные