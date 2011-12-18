Цепочка = require './conveyor'
цепь = (вывод) -> new Цепочка('web', вывод)

снасти = require './tools'

хранилище = global.db

Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

exports.войти = (пользователь, ввод, вывод, возврат) ->
	if ввод.session?
		if ввод.session.data.пользователь?
			if ввод.session.data.пользователь._id == пользователь._id
				return
		ввод.session.data.пользователь = пользователь
	else
		вывод.cookie 'user', пользователь._id, { expires: Cookie_expiration_date, httpOnly: true }
		
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