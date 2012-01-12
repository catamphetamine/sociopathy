connect = require 'connect'
express = require 'express'

redis_session_store_constructor = require('./connect_redis_session_store')(express)
		
redis_store = new redis_session_store_constructor({ prefix: Options.User.Session.Redis.Prefix })
global.redis_session_store = redis_store
get_session_id = (ввод) ->
	ввод.cookies.user
session = require('./connect_session')(get_session_id, redis_store)

получатель_настроек = (ввод, вывод, следующий) ->
	ввод.настройки = снасти.настройки(ввод)
	следующий()
	
access_logger = (ввод, вывод, следующий) ->
	следующий()
	return if not ввод.session?
	хранилище.collection('people').update({ _id: ввод.session.пользователь._id }, { $set: { 'когда был здесь': new Date() }})
	
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
			приложение.use access_logger
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