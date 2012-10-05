http.get '/сеть/мусорка', (ввод, вывод, пользователь) ->
	цепь(вывод)
		.сделать ->
			снасти.batch_loading(ввод, { from: 'system_trash', query: {}, parameters: { sort: [['_id', -1]] } }, @.в 'trash')
			
		.сделать ->
			console.log(@.$.trash)
			пользовательское.подставить(@.$.trash, 'кто_выбросил', @)
			
		.сделать ->
			вывод.send(@.$)
			
global.system_trash = (что, data, пользователь, возврат) ->
	данные = { что: что, когда_выброшено: new Date(), кто_выбросил: пользователь._id }
	
	for key, value of data
		данные[key] = value
	
	db('system_trash').save(данные, возврат)