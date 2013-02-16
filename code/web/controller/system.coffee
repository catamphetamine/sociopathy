http.get '/versioning', (ввод, вывод) ->
	data =
		site_version: Options.Version
		development: Options.Development

	вывод.send(data)
	
http.put '/ошибка', (ввод, вывод) ->
	console.log '======================== Client Error ========================'
	console.log 'Тип: ' + ввод.данные.тип
	console.log 'Ошибка: ' + ввод.данные.ошибка
	console.log 'Где: ' + ввод.данные.адрес
	if ввод.данные.пользователь?
		console.log 'Пользователь: ' + ввод.данные.пользователь
	console.log '=============================================================='

	ввод.данные.когда = new Date()

	db('errors')._.save(ввод.данные)

	вывод.send {}
	
http.get '/сеть/ошибки', (ввод, вывод, пользователь) ->
	пользовательское.проверить_полномочия('управляющий', пользователь)
	ошибки = db('errors')._.find({}, { sort: [['_id', -1]] })
	пользовательское.подставить.await(ошибки, 'пользователь')
	вывод.send(ошибки: ошибки)

http.get '/initialize', (ввод, вывод) ->
	data =
		invites: Options.Invites
		
	locales = require('./../tools/locale').list(ввод)
	locale = locales.best()
	
	data.язык = locale.language
	data.страна = locale.country
	
	data.языки = locales.languages()

	вывод.send(data)
	
http.get '/сеть/мусорка', (ввод, вывод, пользователь) ->
	trash = снасти.batch_loading.await(ввод, { from: 'system_trash', query: {}, parameters: { sort: [['_id', -1]] } })
	пользовательское.подставить.await(trash, 'кто_выбросил')
	вывод.send(trash: trash)
			
global.system_trash = (что, data, пользователь) ->
	мусор = { что: что, когда_выброшено: new Date(), кто_выбросил: пользователь._id }
	
	мусор.данные = data
	
	db('system_trash')._.save(мусор)