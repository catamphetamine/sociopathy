http.get '/сеть/управление/сводка', (ввод, вывод, пользователь) ->
	пользовательское.проверить_полномочия('управляющий', пользователь)

	version = Options.Version
	
	if Options.Development
		version += ' (development)'

	memory_stats = process.memoryUsage()
	
	#memory = {}
	#memory.Available = Math.round(memory_stats.heapTotal / (1024 * 1024)) + ' MB'
	#memory.Used = Math.round(memory_stats.heapUsed / (1024 * 1024)) + ' MB'

	date_interval = (interval) ->
		one_hour = 1000 * 60 * 60
		one_day = one_hour * 24
		
		days = Math.floor(interval / one_day)
		
		left = interval - days * one_day
		
		hours  = Math.floor(left / one_hour)
		
		text = ''
		
		if days > 0
			text = days + ' days '
		
		text += hours + ' hours'
		
		return text
	
	all_uploads_folder = Root_folder + '/загруженное'
	
	temporary_uploads_folder = all_uploads_folder + '/временное'
	temporary_uploads_size = null
	
	if disk_tools.exists(temporary_uploads_folder)
		temporary_uploads_size = disk_tools.size(temporary_uploads_folder)
		
	uploads_folder_size = disk_tools.size(all_uploads_folder) - temporary_uploads_size

	database_folder = Root_folder + '/../database'
	
	print_size = (size) ->
		Math.round(size / (1024 * 1024)) + ' MB'

	folder_size = (path) ->
		if not disk_tools.exists(path)
			return
		
		disk_tools.size(path)

	print_folder_size = (path) ->
		size = folder_size(path)
		
		if not size?
			return '«' + path + '» folder not found'
		
		return print_size(size)

	cpu = 'not measured'
	
	if global.CPU_usage?
		cpu = global.CPU_usage + '%'

	stats =
		version: version
		uptime: date_interval(new Date() - Started_at)
		cpu: cpu
		memory: print_size(memory_stats.heapUsed)
		websocket_connections: [Object.size(эфир.соединения.эфир) + ' ether', Object.size(эфир.соединения.болталка) + ' chat', Object.size(эфир.соединения.беседы) + ' talks', Object.size(эфир.соединения.обсуждения) + ' discussions', Object.size(эфир.соединения.новости) + ' news'].join(', ')
		temporary_storage_for_upload_size: print_folder_size(temporary_uploads_folder)
		uploaded: print_size(uploads_folder_size)
		database_size: print_folder_size(database_folder)

	вывод.send(stats: stats)

http.post '/сеть/управление/приглашение/выдать', (ввод, вывод, пользователь) ->
	пользовательское.проверить_полномочия('приглашения', пользователь)
	ключ = пользовательское.приглашение()
	приглашение = db('invites')._.save({ ключ: ключ, пользователь: пользователь._id })
	вывод.send(приглашение)
	
# Database Altering Script
# used for testing, develpoment, etc
http.post '/сеть/управление/хранилище/изменить', (ввод, вывод, пользователь) ->
	пользовательское.проверить_полномочия('управляющий', пользователь)
	
	человек = db('people')._.find_one({ имя: 'Дождь со Снегом' })
	второй_человек = db('people')._.find_one({ имя: 'Анна Каренина' })

	вывод.send {}

# Database Altering Script
# used for testing, develpoment, etc
http.get '/сеть/управление/хранилище/изменить', (ввод, вывод, пользователь) ->
	пользовательское.проверить_полномочия('управляющий', пользователь)
	
	вывод.send {}

http.get '/хранилище/создано ли', (ввод, вывод) ->
	count = null
	
	try
		count = db('people')._.count({})
	catch ошибка
		if ошибка.message != 'ns not found'
			console.error ошибка
			throw ошибка
		
	вывод.send(создано: count > 0)

http.post '/хранилище/создать', (ввод, вывод) ->
	человек = null
	
	разделы = null
	
	console.log('* Создаём хранилище')
	
	обсуждение = null
	беседа = null
	
	чистое_хранилище = yes
	
	count = null
	
	try
		count = db('people')._.count({})
	catch ошибка
		if ошибка.message != 'ns not found'
			console.error ошибка
			throw ошибка
		
	if count > 0
		чистое_хранилище = no
		
	if not чистое_хранилище
		console.error 'Database Drop attempt'
		throw 'Хранилище уже заполнено, и не может быть перезаписано'
	
	console.log('* Можно')
		
	# заполнить людей
	
	console.log('* Заполняем людей')
				
	хранилище.create_collection('people', [['почта', yes], ['имя', yes], ['id', yes]])

	# заполнить сессии людей
					
	console.log('* Sessions')
	
	хранилище.create_collection('people_sessions', [['пользователь', yes]])
	
	# заполнить тайные ключи людей
	
	console.log('* Private keys')
	
	хранилище.create_collection('people_private_keys', [['пользователь', yes], ['тайный ключ', yes]])
	
	# заполнить приглашения
		
	console.log('* Invites')
	
	хранилище.create_collection('invites', [['ключ', yes]])

	# создать управляющего
	
	console.log('* Creating system administrator')
	
	administrator = {}
	
	if ввод.данные.administrator?
		administrator = JSON.parse(ввод.данные.administrator)
	
	# временное
	if administrator.gender?
		if administrator.gender == 'male'
			administrator.gender = 'мужской'
		else
			administrator.gender = 'женский'
	
	database_schema = International[ввод.cookies.language].Database
	
	# это следует также вынести в translation
	человек =
		имя: administrator[database_schema.people.name]
		описание: administrator[database_schema.people.description]
		пол: administrator[database_schema.people.gender]
		откуда: administrator[database_schema.people.origin]
		пароль: administrator[database_schema.people.password]
		почта: administrator[database_schema.people.email]
		
	человек.полномочия = ['управляющий']
			
	пользовательское.создать(человек)
					
	#хранилище.create_collection('diaries', [[[[ 'пользователь', 1 ], [ 'id', 1 ]], yes], ['время', no]])
	#хранилище.create_collection('journals', [[[[ 'пользователь', 1 ], [ 'id', 1 ]], yes], ['время', no]])
	#хранилище.create_collection('drafts', [[[['пользователь', 1], ['что', 1]], no], [[['пользователь', 1], ['заметка', 1]], yes]])
	
	# готово
	
	console.log('* Done')
		
	вывод.send { ok: 'хранилище создано' }