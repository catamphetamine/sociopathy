http.get '/сеть/мусорка', (ввод, вывод, пользователь) ->
	trash = снасти.batch_loading.await(ввод, { from: 'system_trash', query: {}, parameters: { sort: [['_id', -1]] } })
	пользовательское.подставить.await(trash, 'кто_выбросил')
	вывод.send(trash: trash)
			
global.system_trash = (что, data, пользователь, возврат) ->
	данные = { что: что, когда_выброшено: new Date(), кто_выбросил: пользователь._id }
	
	for key, value of data
		данные[key] = value
	
	db('system_trash').save(данные, возврат)