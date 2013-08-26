хранилище.create_collection('errors', { options: { capped: yes, size: 100 } })

ошибка = global.ошибка
global.ошибка = (data) ->
	ошибка(data)
	try
		db('errors')._.save(data)
	catch error
		console.log('* Failed to log the error into the database:')

http.put '/ошибка', (ввод, вывод) ->
	ввод.данные.client_side = yes
	global.ошибка(ввод.данные)
	вывод.send {}
	
http.get '/сеть/ошибки', (ввод, вывод, пользователь) ->
	пользовательское.проверить_полномочия('управляющий', пользователь)
	
	$ = {}
	снасти.batch_loading(ввод, $, 'ошибки', { from: 'errors', query: {}, parameters: { sort: [['_id', -1]] } })
	#console.log($.ошибки)
	пользовательское.подставить.do($.ошибки, 'пользователь')
	вывод.send $