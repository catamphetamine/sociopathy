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
	new Цепочка(возврат)
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
	
снасти.batch_loading = (ввод, options, возврат) ->
	с = ввод.настройки.с
	collection = db(options.from)
	data = null
	
	new Цепочка(возврат)
		.сделать ->
			query_options = { limit: ввод.настройки.сколько, sort: [['$natural', -1]] }
			query = Object.clone(options.query)
			
			if с?
				с =  collection.id(с)
				query._id = { $lt: с }
			
			collection.find(query, query_options).toArray(@)
			
		.сделать (batch) ->
			data = batch
			if batch.length < ввод.настройки.сколько
				return @.done()
			
			more = Object.clone(options.query)
			more._id = { $lt: batch.last()._id }
			collection.find(more, { limit: 1 }).toArray(@)
		
		.сделать (more) ->
			if more? && !more.пусто()
				@.$['есть ещё?'] = yes
			else
				@.$['есть ещё?'] = no
				
			return @.done(data)
	
module.exports = снасти