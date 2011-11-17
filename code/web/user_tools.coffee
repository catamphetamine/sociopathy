hash = require './whirlpool.hash'

Цепочка = require './conveyor'
цепь = (вывод) -> new Цепочка('web', вывод)

хранилище = global.db

Cookie_expiration_date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 50)

generate_remember_me = (пользователь) ->
	hash(пользователь.имя + пользователь.пароль)

exports.войти = (пользователь, ввод, вывод) ->
	ввод.session.пользователь = пользователь
	вывод.cookie 'user', пользователь._id, { expires: Cookie_expiration_date, httpOnly: true }
	вывод.cookie 'remember me', generate_remember_me(пользователь), { expires: Cookie_expiration_date, httpOnly: true }
	
exports.выйти = (ввод, вывод) ->
	вывод.clearCookie 'connect.sid'
	вывод.clearCookie 'user'
	вывод.clearCookie 'remember me'
	
	ввод.session.пользователь = null

exports.проверить = (номер_пользователя, remember_me, вывод, возврат) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findById номер_пользователя, @
			
		.сделать (пользователь) ->
			if not пользователь?
				return возврат false
			if generate_remember_me(пользователь) != remember_me
				return возврат false
			возврат null, пользователь