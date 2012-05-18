http = require 'http'
адрес = require 'url'
connect_utilities = require('connect').utils
file_system = require 'fs'

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
			вывод.send @.$.данные
			
		.ошибка (ошибка) ->
			возврат ошибка
	
снасти.получить_страницу = (название, данные_для_страницы, ввод, вывод, callback) ->
	options = 
		host: 'localhost'
		port: 8082
		path: '/page.sjs' + '?' + 'path=' + encodeURIComponent(название) + '&' + 'data=' + encodeURIComponent(JSON.stringify(данные_для_страницы))
	
	снасти.получить_данные options, callback
	
снасти.hash = (что, настройки, callback) ->
	if typeof настройки == 'function'
		callback = настройки
		настройки = {}

	чем = 'whirlpool'
	
	options = 
		host: 'localhost'
		port: 8090
		path: '/hash/whirlpool/' + encodeURIComponent(что)
		
#	if настройки.random?
#		options.path += '&' + 'random=' + настройки.random
		
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
				
			if error?
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
	снасти.переместить_и_переименовать(путь, { место: yes, имя: имя }, возврат)

снасти.переместить = (путь, куда, возврат) ->
	снасти.переместить_и_переименовать(путь, { место: куда, имя: yes }, возврат)

снасти.имя_файла = (путь) ->
	путь = путь.to_unix_path()
	путь.substring(путь.lastIndexOf('/') + 1)

снасти.путь_к_файлу = (путь) ->
	путь = путь.to_unix_path()
	путь.substring(0, путь.lastIndexOf('/'))
	
снасти.переместить_и_переименовать = (путь, куда, возврат) ->
	путь = путь.to_unix_path()
	
	место = путь.substring(0, путь.lastIndexOf('/'))
	имя_файла = путь.substring(путь.lastIndexOf('/') + 1)
	
	разширение = ''
	последняя_точка = имя_файла.lastIndexOf('.')
	if последняя_точка >= 0
		разширение = имя_файла.substring(последняя_точка + 1)
	
	if куда.место == yes
		куда.место = место
		
	if куда.имя == yes
		куда.имя = имя_файла
		
	в_путь = куда.место + '/' + куда.имя

	переименовать = () ->
		file_system.rename(путь, в_путь, возврат)
	
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

снасти.ошибка = (ошибка) ->
	if typeof ошибка == 'string'
		return ошибка
	if ошибка.stack?
		return ошибка.stack
	return require('util').inspect(ошибка)
	
снасти.сейчас = (настройки) ->
	if настройки.минуты?
		return new Date().toString('dd.MM.yyyy HH:mm')
	new Date().toString('dd.MM.yyyy')
	
снасти.сделать_id = (id) ->
	id = id.to_unix_file_name()
	id
	
module.exports = снасти

Array.prototype.is_empty = () ->
	@length == 0
	
Array.prototype.пусто = () ->
	@is_empty()
	
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
	
Array.prototype.has = (element) ->
	@indexOf(element) >= 0

RegExp.escape = (string) ->
	specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g")
	return string.replace(specials, "\\$&")

String.prototype.replace_all = (what, with_what) ->
	regexp = new RegExp(RegExp.escape(what), "g")
	return @replace(regexp, with_what)
	
String.prototype.escape_html = ->
	@replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
	
String.prototype.to_unix_path = ->
	@replace(/\\/g, '/')
	
String.prototype.to_unix_file_name = ->
	if @ == '.' || @ == '..'
		throw 'Invalid Unix file name: ' + @
	@replace(/\//g, encodeURIComponent('/'))
	#.replace(/\|/g, encodeURIComponent('|')).replace(/;/g, encodeURIComponent(';'))
	
Object.merge_recursive = (obj1, obj2) ->
	for ключ, значение of obj2
		#if obj2.hasOwnProperty(ключ)
		if typeof obj2[ключ] == 'object'
			obj1[ключ] = Object.merge_recursive(obj1[ключ], obj2[ключ])
		else
			obj1[ключ] = obj2[ключ]

	return obj1

Object.выбрать = (названия, object) ->
	if object instanceof Array
		i = 0
		while i < object.length
			object[i] = Object.выбрать(названия, object[i])
			i++
		return object
		
	поля = {}
	for название in названия
		поля[название] = object[название]
	поля
	
Object.get_keys = (object) ->
	keys = []
	for key, value of object
		if object.hasOwnProperty(key)
			keys.push(key)
	keys
	
RegExp.escape = (string) ->
	specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", 'g')
	new String(string).replace(specials, "\\$&")