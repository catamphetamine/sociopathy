connect = require 'connect'
express = require 'express'

require('./connect_redis_session_store')
		
redis_store = new (require('./connect_redis_session_store')(express))()
get_session_id = (ввод) ->
	ввод.cookies.user
session = require('./connect_session')(get_session_id, redis_store)

получатель_настроек = (ввод, вывод, следующий) ->
	ввод.настройки = снасти.настройки(ввод)
	следующий()
	
remember_me = (ввод, вывод, следующий) ->
	тайный_ключ = ввод.cookies.user

	if not тайный_ключ?
		return следующий()
		
	if ввод.session.пользователь?
		return следующий()
		
	следующий = снасти.приостановить_ввод(ввод, следующий)
	цепь(вывод)
		.сделать ->
			пользовательское.опознать(тайный_ключ, @)
			
		.ошибка (ошибка) ->
			console.error ошибка
			пользовательское.выйти(ввод, вывод)
			следующий()
			
		.сделать (пользователь) ->
			пользовательское.войти(пользователь, ввод, вывод, @)
			
		.сделать () ->
			следующий()
	
module.exports = (приложение) ->
	if not приложение?
		приложение = express.createServer()
		global.приложение = приложение

		приложение.configure ->
			приложение.use express.bodyParser()
			приложение.use express.methodOverride()
			приложение.use express.cookieParser()
			приложение.use session
			приложение.use получатель_настроек
			приложение.use remember_me
			приложение.use приложение.router
	
		приложение.configure 'development', ->
			приложение.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
	
		приложение.configure 'production', ->
			#приложение.use express.errorHandler()
		
	снасти = {}
	
	снасти.http = {}
	
	['get', 'post', 'put', 'delete'].forEach (способ) ->
		снасти.http[способ] = (адрес, возврат) ->
			приложение[способ] encodeURI(адрес), возврат
		
	снасти