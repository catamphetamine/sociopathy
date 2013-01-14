http = require 'http'
адрес = require 'url'
connect_utilities = require('connect').utils
file_system = require 'fs'

global.synchronous = require 'sync'

Function.prototype.synchronized = () ->
	parameters = Array.prototype.slice.call(arguments)
	@synchronize(@).apply(@, parameters)
	
Function.prototype.synchronize = (binding) ->
	return () =>
		parameters = Array.prototype.slice.call(arguments)
		# add binding as a first argument
		parameters.unshift(binding)
		@sync.apply(@, parameters)
	
global.db = (collection) ->
	mongo = хранилище.collection(collection)
	
	api = {}
	
	api.find_one = mongo.findOne.synchronize(mongo)
	
	api.count = mongo.count.synchronize(mongo)
	
	api.find = (query, options) ->
		object = mongo.find(query, options)
		object.toArray.synchronize(object)()

	api.update = mongo.update.synchronize(mongo)
	api.save = mongo.save.synchronize(mongo)
	
	mongo._ = api
	mongo

снасти = {}

снасти.отдать_страницу = (название, данные_для_страницы, ввод, вывод, возврат) ->
	цепь(возврат)
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
		if значение?
			if (typeof значение != 'string')
				настройки[ключ] = значение + ''
	
	#for ключ, значение of настройки
	#	if (typeof значение is 'string')
	#		if "#{parseInt(значение)}" == значение
	#			настройки[ключ] = parseInt(значение)
	#		else if "#{parseFloat(значение)}" == значение
	#			настройки[ключ] = parseFloat(значение)
	
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
	после = ввод.настройки.после
	collection = db(options.from)
	data = null
				
	parameters = options.parameters || {}
	
	цепь(возврат, { manual: yes })
		.сделать ->
			query_options = Object.x_over_y(parameters, { limit: ввод.настройки.сколько, sort: [['_id', -1]] })
			query = Object.clone(options.query)
			
			if после?
				после =  collection.id(после)
				query._id = { $lt: после }
					
			batch = collection._.find(query, query_options)
					
			data = batch
			if batch.length < ввод.настройки.сколько
				return @.done(data)
			
			more = Object.clone(options.query)
			more._id = { $lt: batch.last()._id }
			
			query_options = Object.x_over_y(parameters, { limit: 1, sort: [['_id', -1]] })
			
			more = collection._.find(more, query_options)
			
			if more? && !more.пусто()
				возврат.$['есть ещё?'] = yes
			else
				возврат.$['есть ещё?'] = no
				
			return @.done(data)
		
		.go()
			
снасти.escape_id = (id) ->
	'/\?@#&%*:|"\'<>.'.split('').forEach((symbol) -> id = id.replace_all(symbol, ''))
	id
	
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

снасти.generate_unique_id = (base, проверка, options, возврат) ->
	if not возврат?
		возврат = options
		options = {}
	
	id = null
	if not options.base_is_reserved?
		id = снасти.escape_id(base)
	else
		id = снасти.generate_id(base, options)
		
	цепь(возврат)
		.сделать ->
			проверка(id, @)
			
		.сделать (unique) ->
			if unique
				return @.return(id)
			
			next_options = { base_is_reserved: yes }
			
			if options.base_is_reserved?
				next_options.randomize = yes
			
			снасти.generate_unique_id(id, проверка, next_options, возврат)

#снасти.generate_unique_id('abc/\?%def*:|"<>. spacebar', ((id, callback) -> console.log('trying id = ' + id); callback(null, id.length > 40)), ((error, id) -> console.log(id)))

# check = (id, возврат) ->
#	цепь(возврат)
#		.сделать ->
#			db('').findOne({ id: id }, @)
#			
#		.сделать (found) ->
#			@.done(not found?)
#
# снасти.generate_unique_id(title, check, @)

#console.log(снасти.escape_id('abc/\?%def*:|"<>. spacebar'))

#id = снасти.generate_id('abc/\?%def*:|"<>. spacebar')
#console.log(id)
#console.log(снасти.generate_id(id, { randomize: yes }))
	
module.exports = снасти

global.show_error = (ошибка) ->
	throw { error: ошибка, display_this_error: yes }

global.web_socket = (соединение) ->
	соединение.old_on = соединение.on
	
	соединение.on = (message_type, action) ->
		@old_on message_type, (message) =>
			цепь(@)
				.сделать ->
					synchronous ->
						action(message)
				.go()