http.get '/сеть/мусорка', (ввод, вывод, пользователь) ->
	trash = снасти.batch_loading.await(ввод, { from: 'system_trash', query: {}, parameters: { sort: [['_id', -1]] } })
	пользовательское.подставить.await(trash, 'кто_выбросил')
	вывод.send(trash: trash)
			
http.post '/сеть/мусорка/восстановить', (ввод, вывод, пользователь) ->
	_id = db('system_trash').id(ввод.данные._id)
	
	вывод.send({})
	
global.system_trash = (что, data, пользователь) ->
	мусор = { что: что, когда_выброшено: new Date(), кто_выбросил: пользователь._id }
	
	мусор.данные = data
	
	db('system_trash')._.save(мусор)