#connect = require 'connect'
express = require 'express'
session = require './connect session'

получатель_данных = (ввод, вывод, следующий) ->
	ввод.данные = снасти.данные(ввод)
	следующий()
			
activity = (ввод, вывод, следующий) ->
	if not ввод.пользователь?
		return следующий()
		
	_id = ввод.пользователь._id
	user_id = ввод.пользователь._id + ''
	
	if Activity[user_id]?
		return следующий()
	
	Activity.monitor(_id)
	Activity[user_id].detected()
	следующий()
	
remember_me = (ввод, вывод, следующий) ->
	тайный_ключ = ввод.cookies.user

	if not тайный_ключ?
		return следующий()
		
	if ввод.пользователь?
		return следующий()
		
	следующий = снасти.приостановить_ввод(ввод, следующий)
	
	fiber ->
		try
			пользователь = пользовательское.опознать.do(тайный_ключ)
			пользовательское.войти.do(пользователь, ввод, вывод)
			
		catch ошибка
			console.error ошибка
			пользовательское.выйти(ввод, вывод)
			
		следующий()
		
is_internal_url = (url) ->
	for language, urls of Url_map
		if url.starts_with(urls.network + '/')
			return yes
			
module.exports = (приложение) ->
	if not приложение?  
		приложение = express()
		global.приложение = приложение
		
		global.http_server = require('http').createServer(приложение)

		приложение.configure ->
			#приложение.use express.compress()
			приложение.use express.bodyParser()
			приложение.use express.methodOverride()
			приложение.use express.cookieParser()
			приложение.use session
			приложение.use получатель_данных
			приложение.use remember_me
			приложение.use activity
			#приложение.use require('./../tools/locale').middleware
			приложение.use приложение.router
	
		приложение.configure 'development', ->
			приложение.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
	
		приложение.configure 'production', ->
			#приложение.use express.errorHandler()
		
		fiberize.express_action = (действие, адрес, ввод, вывод) ->
			if is_internal_url(адрес)
				return if пользовательское.требуется_вход(ввод, вывод)
	
				пользователь = пользовательское.пользователь(ввод)
				действие(ввод, вывод, пользователь)
			else
				действие(ввод, вывод)
			
		fiberize.express(приложение)
