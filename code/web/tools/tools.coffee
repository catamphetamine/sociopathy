http = require 'http'
адрес = require 'url'
connect_utilities = require('connect').utils
file_system = require 'fs'

снасти = {}

снасти.отдать_страницу = (название, данные_для_страницы, ввод, вывод) ->
	if memcache_available
		try
			данные = memcache.get.do(название)
			
			if данные?
				return вывод.send(данные)
		catch error
			# если memcache не сумел взять данные - не страшно
			console.error error
	
	данные = снасти.получить_страницу.do(название, данные_для_страницы, ввод, вывод)

	вывод.send(данные)
		
	if memcache_available
		try
			memcache.set(название, данные, (() ->), 60 * 60)
		catch error
			# если memcache не сумел взять данные - не страшно
			console.error error
	
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

снасти.данные = (ввод) ->
	if ввод.body? && not Object.пусто(ввод.body)
		return ввод.body
	
	данные = адрес.parse(ввод.url, true).query
	
	for ключ, значение of данные
		if значение?
			if (typeof значение != 'string')
				данные[ключ] = значение + ''
	
	return данные
	
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
	mode = 0o777
	
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
	
снасти.batch_loading = (ввод, куда, свойство, options) ->
	if not options.после?
		options.после = (_id) -> _id
	
	после = options.после(ввод.данные.после)
	collection = db(options.from)
	data = null
	
	if not options.задом_наперёд?
		options.задом_наперёд = yes
	
	parameters = options.parameters || {}
	
	if not parameters.sort?
		_id_sorting = null
		if options.задом_наперёд?
			_id_sorting = -1
		else
			_id_sorting = 1
			
		parameters.sort = [['_id', _id_sorting]]
	
	query_options = Object.x_over_y(parameters, { limit: ввод.данные.сколько, sort: parameters.sort })
	query = Object.clone(options.query)

	сравнение = null
	if options.задом_наперёд?
		сравнение = '$lt'
	else
		сравнение = '$gt'
		
	if после?
		if not options.после_query?
			options.после_query = (после, query) -> 
				query._id = {}
				query._id[сравнение] = collection.id(после)
				
		options.после_query(после, query)
			
	batch = collection._.find(query, query_options)
	
	if batch.пусто()
		куда[свойство] = batch
		return batch
	
	more_query = null
	
	if not options.more_query?
		options.more_query = (last, query) ->
			query._id = {}
			query._id[сравнение] = last._id
		
	more_query = Object.clone(options.query)
	options.more_query(batch.last(), more_query)
	
	query_options = Object.x_over_y(parameters, { limit: 1, sort: parameters.sort })
	
	more = collection._.find(more_query, query_options)
	
	if more? && !more.пусто()
		куда['есть ещё?'] = yes
	else
		куда['есть ещё?'] = no
		
	куда[свойство] = batch
	return batch
			
снасти.escape_id = (id) ->
	'/\?@#&%*:|"\'<>.'.split('').concat(['\r', '\n', '\t']).forEach((symbol) -> id = id.replace_all(symbol, ' '))
	while id.contains('  ')
		id = id.replace_all('  ', ' ')
	id.trim()
	
Digit_symbols = '☀★☄☆☭☮☯☢☤☣☁'

снасти.цифру_в_символ = (цифра) ->
	Digit_symbols[цифра]
  
снасти.цифры_в_символы = (строка) ->
	преобразователь = (символ) ->
		if not isNaN(parseInt(символ))
			return снасти.цифру_в_символ(символ)
		символ
	строка.split('').map(преобразователь).join('')
	
снасти.generate_id = (base, options) ->
	options = options || {}
	now = new Date()
	if not options.randomize?
		title = снасти.escape_id(base)
		return title + ', ' + now.toString('dd.MM.yyyy в HH:mm')
	else
		return base + Digit_symbols.random()

снасти.generate_unique_id = (base, проверка, options) ->
	options = options || {}
	
	id = null
	if not options.base_is_reserved?
		id = снасти.escape_id(base)
	else
		id = снасти.generate_id(base, options)
	
	if проверка(id)
		return id
		
	next_options = { base_is_reserved: yes }
	
	if options.base_is_reserved?
		next_options.randomize = yes
	
	return снасти.generate_unique_id(id, проверка, next_options)

module.exports = снасти

global.show_error = (ошибка) ->
	throw { error: ошибка, display_this_error: yes }

global.ошибка = (data) ->
	if not data?
		console.log '======================= Unknown Error ========================'
		console.log(data)
		console.log '=============================================================='
		return 
	
	if data.client_side?
		console.log '======================== Client Error ========================'
	else
		console.log '=========================== Error ============================'
	
	if data.тип?
		console.log 'Тип: ' + data.тип
	
	console.log 'Ошибка: ' + data.ошибка
	
	if data.адрес?
		console.log 'Где: ' + data.адрес
		
	if data.пользователь?
		console.log 'Пользователь: ' + data.пользователь
		
	console.log '=============================================================='

	data.когда = new Date()
	
require './uri'
	
проверить_ссылку = (ссылка) ->
	uri = null
	
	try
		uri = Uri.parse(ссылка)
	catch error
		console.log error
		return no
	
	protocol = null

	#console.log uri.protocol

	if uri.protocol == 'http'
		protocol = require 'http'
		uri.port = uri.port || 80
	else if uri.protocol == 'https'
		protocol = require 'https'
		uri.port = uri.port || 443
	else
		return
	
	options =
		host: uri.host
		port: uri.port
		path: uri.path + '?' + uri.parameters_raw
		method: 'GET'
	
	console.log options
	
	request = (options, callback) ->
		request = protocol.request options, (response) ->
			#response.on 'data', (chunk) ->
			#	data += chunk
			
			#response.on 'end', ->
			#	console.log(data)
			
			callback(null, { request: request, response: response })
	
		request.on 'error', (error) ->
			callback(error.message)
	
		request.end()
	
	response = request.do(options).response
	
	#console.log response.statusCode
	
	#if (response.statusCode + '').starts_with('3')
	#	return no
	
	if (response.statusCode + '').starts_with('4')
		return no
	
	return yes
	
global.gender = (пол) ->
	if typeof пол != 'string'
		пол = пол.пол
		
	switch пол
		when 'женский'
			return 'female'
			
		when 'мужской'
			return 'male'