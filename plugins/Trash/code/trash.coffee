хранилище.create_collection('system_trash', { options: { capped: yes, size: 1000 } }, [['что', no]])
хранилище.create_collection('trash', { options: { capped: yes, size: 10000 } }, [['пользователь', no]])

http.get '/сеть/мусорка', (ввод, вывод, пользователь) ->
	$ = {}
	снасти.batch_loading(ввод, $, 'trash', { from: 'system_trash', query: {}, parameters: { sort: [['_id', -1]] } })
	пользовательское.подставить.do($.trash, 'кто_выбросил')
	вывод.send $
			
http.post '/сеть/мусорка/восстановить', (ввод, вывод, пользователь) ->
	_id = db('system_trash').id(ввод.данные._id)
	
	trash = db('system_trash').get(_id)
	
	switch trash.что
		when 'раздел читальни'
			console.log('')
		when 'заметка читальни'
			console.log('')
		when 'книга'
			console.log('')
		else
			console.log('')
	
	вывод.send({})
	
global.system_trash = (что, data, пользователь) ->
	мусор = { что: что, когда_выброшено: new Date(), кто_выбросил: пользователь._id }
	
	мусор.данные = data
	
	db('system_trash').add(мусор)