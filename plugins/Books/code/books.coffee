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

http.get '/сеть/книга', (ввод, вывод) ->
	книга = db('books')._.find_one(ввод.данные._id)
	вывод.send(книга: книга)
	
http.get '/сеть/книги/поиск', (ввод, вывод) ->
	шаблон = '.*' + RegExp.escape(ввод.данные.query) + '.*'
	
	книги = db('books')._.find({ название: { $regex: шаблон, $options: 'i' } }, { limit: ввод.данные.max })
	
	Object.выбрать(['_id', 'название', 'сочинитель'], книги)
	
	вывод.send(книги: книги)