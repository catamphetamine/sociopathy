express = require 'express'
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
	if ввод.session.пользователь?
		return следующий()
		
	remember_me = ввод.cookies['remember me']
	if not remember_me?
		return следующий()
	
	номер_пользователя = ввод.cookies.user
	if not номер_пользователя?
		return следующий()
		
	пользовательское.проверить номер_пользователя, remember_me, (ошибка, пользователь) ->
		if ошибка?
			пользовательское.выйти ввод, вывод
		else
			пользовательское.войти пользователь, ввод, вывод
		следующий()
			
module.exports = (приложение) ->
	if not приложение?
		приложение = express.createServer()
		global.application = приложение

		приложение.configure ->
			приложение.use express.bodyParser()
			приложение.use express.methodOverride()
			приложение.use express.cookieParser()
			приложение.use express.session secret: "какой-то ключ"
			приложение.use получатель_настроек
			приложение.use remember_me
			приложение.use приложение.router
	
		приложение.configure 'development', ->
			приложение.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
	
		приложение.configure 'production', ->
			приложение.use express.errorHandler()
			
		global.websocket = io.listen приложение
	
	снасти = {}
	
	снасти.http = {}
	
	['get', 'post', 'put', 'delete'].forEach (способ) ->
		снасти.http[способ] = (адрес, возврат) ->
			приложение[способ] encodeURI(адрес), возврат
		
	снасти