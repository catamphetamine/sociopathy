http.get '/сеть/книги', (ввод, вывод) ->
	options =
		collection: 'books'
		query: {},
		total: yes
	
	result = either_way_loading.await(ввод, options)
	
	ответ = 
		книги: result.data
		'есть ещё?': result['есть ещё?']
		'есть ли предыдущие?': result['есть ли предыдущие?']
		всего: result.всего
		
	вывод.send(ответ)

http.get '/человек/книги', (ввод, вывод) ->
	человек = пользовательское.взять.await({ 'адресное имя': ввод.данные['адресное имя'] })
	
	$ = {}
			
	$.пользователь = { имя: человек.имя }
	книги = db('peoples_books')._.find_one({ пользователь: человек._id })
	
	if not книги?
		return вывод.send(книги: [])
	
	books = []
	for книга in книги.книги.reverse()
		books.add(db('books')._.find_one({ _id: книга }))
			
	$.книги = books
	вывод.send $
	
http.get '/сеть/книга', (ввод, вывод) ->
	книга = db('books')._.find_one(ввод.данные._id)
	вывод.send(книга: книга)
	
http.get '/сеть/книги/поиск', (ввод, вывод) ->
	шаблон = '.*' + RegExp.escape(ввод.данные.query) + '.*'
	
	книги = db('books')._.find({ название: { $regex: шаблон, $options: 'i' } }, { limit: ввод.данные.max })
	
	Object.выбрать(['_id', 'название', 'сочинитель'], книги)
	
	вывод.send(книги: книги)
	
http.put '/сеть/книжный шкаф', (ввод, вывод, пользователь) ->
	книга = db('books')._.find_one(ввод.данные._id)
	
	books = db('peoples_books')._.find_one({ пользователь: пользователь._id })
	if not books?
		db('peoples_books')._.save({ пользователь: пользователь._id, книги: [] })
		
	db('peoples_books')._.update({ пользователь: пользователь._id }, { $addToSet: { книги: книга._id } })
	
	вывод.send {}
	
http.delete '/сеть/книжный шкаф', (ввод, вывод, пользователь) ->
	книга = db('books')._.find_one(ввод.данные._id)
	
	db('peoples_books')._.update({ пользователь: пользователь._id }, { $pull: { книги: книга._id } })
	
	вывод.send {}