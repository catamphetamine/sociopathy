#connect = require 'connect'
express = require 'express'
session = require './connect session'

получатель_данных = (ввод, вывод, следующий) ->
	ввод.данные = снасти.данные(ввод)
	следующий()
	
global.Activity = {}
	
activity = (ввод, вывод, следующий) ->
	_id = ввод.пользователь._id
	user_id = ввод.пользователь._id + ''
	
	if global.Activity[user_id]?
		return следующий()
		
	activity = 
		когда_был_здесь: new Date()
		
		detected: ->
			@когда_был_здесь = new Date()
		
		update: =>
			if @когда_был_здесь_в_последний_раз == @когда_был_здесь
				return
				
			когда_был_здесь = @когда_был_здесь
			@когда_был_здесь_в_последний_раз = @когда_был_здесь
			
			# { w: 0 } = write concern "off"
			db('people_sessions').update({ пользователь: _id }, { $set: { 'когда был здесь': когда_был_здесь }}, { w: 0 }) #, online: yes
		
			check_for_expiration = ->
				fiber ->
					session = db('people_sessions')._.find_one({ пользователь: _id })
		
					когда_был_здесь_в_последний_раз = session['когда был здесь']
		
					if когда_был_здесь_в_последний_раз?
						if когда_был_здесь_в_последний_раз.getTime() == когда_был_здесь.getTime()
							эфир.offline(пользователь)
							#notifier.offline(_id)
									
			if @expiration_check?
				clearTimeout(@expiration_check)
	
			@expiration_check = check_for_expiration.delay(Options.User.Activity.Online_timeout)
			
			@run()
		
		run: ->
			@update.delay(Options.User.Activity.Update_interval)
	
	global.Activity[user_id] = activity
		
	activity.run()
	
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
			пользователь = пользовательское.опознать.await(тайный_ключ)
			пользовательское.войти.await(пользователь, ввод, вывод)
			
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
