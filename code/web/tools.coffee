http = require 'http'
адрес = require 'url'
connect_utilities = require('connect').utils

file_system = require 'fs'

Цепочка = require './conveyor'
цепь = require './web_conveyor'

memcache = global.memcache

снасти = {}

снасти.получить_настройки = (ввод) ->
	настройки = адрес.parse(ввод.url, true).query
	
	for ключ, значение of настройки
		if (typeof значение is 'string')
			if "#{parseInt(значение)}" == значение
				настройки[ключ] = parseInt(значение)
			else if "#{parseFloat(значение)}" == значение
				настройки[ключ] = parseFloat(значение)

	настройки

снасти.отдать_страницу = (название, данные_для_страницы, ввод, вывод, возврат) ->
	new Цепочка()
		.сделать ->
			if global.memcache_available
				try
					memcache.get название, @
				catch error
					@(error)
			else
				@()
				
		.ошибка (ошибка) ->
			# если memcache не сумел взять данные - не страшно
			console.error ошибка
			return no
			
		.сделать (данные) ->
			if not данные?
				return @()
			вывод.send данные

		.сделать ->
			снасти.получить_страницу(название, данные_для_страницы, ввод, вывод, @.в 'данные')

		.сделать (данные) ->
			if global.memcache_available
				try
					memcache.set название, данные, @, 60 * 60
				catch error
					@(error)
			else
				@()
				
		.ошибка (ошибка) ->
			# если memcache не сумел положить данные - не страшно
			console.error ошибка
			return no
			
		.сделать (данные) ->
			вывод.send @.переменная 'данные'
			
		.ошибка (ошибка) ->
			возврат ошибка
	
снасти.получить_страницу = (название, данные_для_страницы, ввод, вывод, callback) ->
	options = 
		host: 'localhost'
		port: 8082
		path: '/page.sjs' + '?' + 'path=' + encodeURIComponent(название) + '&' + 'data=' + encodeURIComponent(JSON.stringify(данные_для_страницы))
	
	снасти.получить_данные options, callback
	
снасти.hash = (что, чем, callback) ->
	options = 
		host: 'localhost'
		port: 8082
		path: '/hash.sjs' + '?' + 'value=' + encodeURIComponent(что) + '&' + 'method=' + 'whirlpool'
		
	снасти.получить_данные options, callback
	
снасти.получить_данные = (options, callback) ->
	if not callback?
		callback = ->
		
	#console.log 'fetching ' + options.path
	#console.log 'started on ' + new Date().getTime()
	
	request = http.get options, (response) =>
		#headers = JSON.stringify(response.headers)
		
		data = ''
		response
			.on 'data', (chunk) ->
				data += chunk 
				
			.on 'end', =>
				#console.log 'fetched ' + options.path
				#console.log 'ended   on ' + new Date().getTime()
				
				callback null, data
				
	request.on 'error', (error) ->
		callback error
		
снасти.приостановить_ввод = (ввод, следующий) ->
	pause = connect_utilities.pause ввод

	return (ошибка) ->
		следующий(ошибка)
		pause.resume()
		
снасти.merge = (first, second) ->
	result = {}
	for own key, value of first
		result[key] = value
	for own key, value of second
		result[key] = value
	result

снасти.настройки = (ввод) ->
	настройки = адрес.parse(ввод.url, true).query
	
	for ключ, значение of настройки
		if (typeof значение is 'string')
			if "#{parseInt(значение)}" == значение
				настройки[ключ] = parseInt(значение)
			else if "#{parseFloat(значение)}" == значение
				настройки[ключ] = parseFloat(значение)
	
	return настройки
	
снасти.cookie = (имя, ввод) ->
	if ввод.cookies?
		return ввод.cookies[имя]
		
	cookie = ввод.headers.cookie || ввод.headers['x-cookie']
	console.log cookie
	if cookie?
		try
			ввод.cookies = connect_utilities.parseCookie(cookie)
			return ввод.cookies[имя]
		catch ошибка
			console.error ошибка
		
снасти.создать_путь = (path, callback) ->
	# default foder mode
	mode = 0777
	
	# change windows slashes to unix
	path =  path.replace(/\\/g, '/')
	
	# remove trailing slash
	if path.substring(path.length - 1) == '/'
		path = path.substring(0, path.length - 1)
	
	check_folder = (path, callback) ->
		file_system.stat(path, (error, info) ->
			if not error?
				# folder exists, no need to check previous folders
				if info.isDirectory()
					return callback()
				
				# file exists at location, cannot make folder
				#return callback(new Error('exists'))
				
			# if it is unkown error
			if error.errno != 2 && error.errno != 32 && error.code != 'ENOENT'
				console.error(require('util').inspect(error, true))
				return callback(error)
			
			# the folder doesn't exist, try one stage earlier then create
		
			# if only slash remaining is initial slash, then there is no where to go back
			if path.lastIndexOf('/') == path.indexOf('/')
				# should only be triggered when path is '/' in Unix, or 'C:/' in Windows
				# (which must exist)
				return callback(new Error('Not found'))
				
			# try one stage earlier
			check_folder(path.substring(0, path.lastIndexOf('/')), (error) ->
				if error?
					return callback(error)
					
				# make this directory
				file_system.mkdir(path, mode, (error) ->
					if error && error.errno != 17
						error = "Failed to create folder #{path}"
						console.error(error)
						return callback(new Error(error))

					callback()
				)
			)
		)
				
	check_folder(path, callback)

снасти.переименовать = (путь, имя, возврат) ->
	# change windows slashes to unix
	путь =  путь.replace(/\\/g, '/')
	
	место = путь.substring(0, путь.lastIndexOf('/'))
	имя_файла = путь.substring(путь.lastIndexOf('/') + 1)
	
	разширение = ''
	последняя_точка = имя_файла.lastIndexOf('.')
	if последняя_точка >= 0
		разширение = имя_файла.substring(последняя_точка + 1)
	
	переименовать = () ->
		file_system.rename(путь, в_путь, возврат)
		
	в_путь = место + '/' + имя
	file_system.stat(в_путь, (ошибка, сводка) ->
		if ошибка?
			return переименовать()
			
		if сводка.isDirectory()
			return переименовать()
			
		file_system.unlink(в_путь, (ошибка) ->
			if ошибка?
				return возврат(ошибка)
			переименовать()
		)
	)
	
снасти.сейчас = (настройки) ->
	if настройки.минуты?
		return new Date().toString('dd.MM.yyyy HH:mm')
	new Date().toString('dd.MM.yyyy')
	
module.exports = снасти

Array.prototype.is_empty = () ->
	@length == 0
	
Array.prototype.trim = () ->
	array = []
	@forEach (element) ->
		if element?
			array.push element
	array
	
Array.prototype.where_am_i = () ->
	try
		this_variable_doesnt_exist['you are here'] += 0
	catch error
		console.log error.stack
		
String.prototype.escape_html = ->
	@replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")