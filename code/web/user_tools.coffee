Цепочка = require './conveyor'
цепь = (вывод) -> new Цепочка('web', вывод)

снасти = require './tools'

хранилище = global.db

Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

exports.войти = (пользователь, ввод, вывод, возврат) ->
	if ввод.session
		if ввод.session.пользователь
			if ввод.session.пользователь.id == пользователь.id
				return
		ввод.session.пользователь = пользователь
	else
		вывод.cookie 'user', пользователь._id, { expires: Cookie_expiration_date, httpOnly: true }
		
	возврат null, пользователь
	
exports.выйти = (ввод, вывод) ->
	ввод.session.destroy()
	вывод.clearCookie 'user'

###
exports.проверить = (номер_пользователя, remember_me, вывод, возврат) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findById номер_пользователя, @.в 'пользователь'
			
		.сделать (пользователь) ->
			if not пользователь?
				return возврат false
			
			generate_remember_me пользователь, @
		
		.сделать (generated_remember_me) ->
			if generated_remember_me != remember_me
				return возврат false
				
			возврат null, @.переменная 'пользователь'
###

exports.получить_пользователя = (номер_пользователя, вывод, возврат) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findById номер_пользователя, @
			
		.сделать (пользователь) ->
			if not пользователь?
				return возврат false
			возврат null, пользователь