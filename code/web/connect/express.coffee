#connect = require 'connect'
express = require 'express'
session = require './connect_session'

получатель_настроек = (ввод, вывод, следующий) ->
	ввод.настройки = снасти.настройки(ввод)
	следующий()
	
access_logger = (ввод, вывод, следующий) ->
	следующий()
	return if not ввод.session?
	
	когда_был_здесь = new Date()
	db('people_sessions').update({ пользователь: ввод.пользователь._id }, { $set: { 'когда был здесь': когда_был_здесь }}) #, online: yes
	
	check_online_status = () ->
		цепь()
			.сделать ->
				db('people_sessions').findOne({ пользователь: ввод.пользователь._id }, @)
				
			.сделать (session) ->
				когда_был_здесь_в_последний_раз = session['когда был здесь']
				if когда_был_здесь_в_последний_раз?
					if когда_был_здесь_в_последний_раз.getTime() == когда_был_здесь.getTime()
						эфир.offline(ввод.пользователь)
						#db('people_sessions').update({ пользователь: ввод.пользователь._id }, { $set: { online: no } })
					ввод.session.delete('online_timeout')
	
	цепь()
		.сделать ->
			ввод.session.get('online_timeout', @)
			
		.сделать (online_timeout) ->
			if online_timeout?
				clearTimeout(online_timeout)
				
			ввод.session.set({ online_timeout: setTimeout(check_online_status, Options.User.Online.Timeout) })
	
remember_me = (ввод, вывод, следующий) ->
	тайный_ключ = ввод.cookies.user

	if not тайный_ключ?
		return следующий()
		
	if ввод.пользователь?
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
			
		.сделать ->
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
		снасти.http[способ] = (адрес, действие) ->
			action = (ввод, вывод) ->
				if адрес.starts_with('/сеть/') || адрес.starts_with('/управление/')
					return if пользовательское.требуется_вход(ввод, вывод)
				
					synchronous () ->
						try
							пользователь = пользовательское.пользователь._()(ввод)
							действие(ввод, вывод, пользователь)
						catch ошибка
							return вывод.send(ошибка: ошибка)
				else
					действие(ввод, вывод)
						
			приложение[способ](encodeURI(адрес), action)
		
	снасти