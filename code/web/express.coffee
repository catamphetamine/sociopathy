express = require 'express'
#session = express.cookieParser
redis_store = new (require('./connect_redis_session_store')(express))()
get_session_id = (ввод) ->
	ввод.cookies.user
session = require('./connect_session')(get_session_id, redis_store)
		
общие_снасти = require './tools'

адрес = require 'url'
io = require 'socket.io'
пользовательское = require './user_tools'

получатель_настроек = (ввод, вывод, следующий) ->
	настройки = адрес.parse(ввод.url, true).query
	
	for ключ, значение of настройки
		if (typeof значение is 'string')
			if "#{parseInt(значение)}" == значение
				настройки[ключ] = parseInt(значение)
			else if "#{parseFloat(значение)}" == значение
				настройки[ключ] = parseFloat(значение)

	ввод.настройки = настройки
	следующий()
	
remember_me = (ввод, вывод, следующий) ->
	номер_пользователя = ввод.cookies.user

	if not номер_пользователя?
		return следующий()
		
	###
	console.log 'ввод.session.id'
	console.log ввод.session.id
	
	console.log 'ввод.session.data.пользователь'
	console.log ввод.session.data.пользователь
	###
	
	if ввод.session.data.пользователь?
		return следующий()
		
	следующий = общие_снасти.приостановить_ввод(ввод, следующий)
	пользовательское.получить_пользователя номер_пользователя, вывод, (ошибка, пользователь) ->
		if ошибка?
			пользовательское.выйти ввод, вывод
			следующий()
		else
			пользовательское.войти пользователь, ввод, вывод, (ошибка, пользователь) ->
				if ошибка?
					console.error ошибка
					вывод.send ошибка: ошибка
				else
					следующий()
			
module.exports = (приложение) ->
	if not приложение?
		приложение = express.createServer()
		global.application = приложение

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
			
		global.websocket = io.listen приложение
	
	снасти = {}
	
	снасти.http = {}
	
	['get', 'post', 'put', 'delete'].forEach (способ) ->
		снасти.http[способ] = (адрес, возврат) ->
			приложение[способ] encodeURI(адрес), возврат
		
	снасти