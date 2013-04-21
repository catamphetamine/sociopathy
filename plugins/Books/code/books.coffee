хранилище.create_collection('books', [['id', yes], [[[ 'сочинитель', 1 ], [ 'название', 1 ]], yes]])
хранилище.create_collection('peoples_books', [['пользователь', yes]])
		
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

http.put '/сеть/книга', (ввод, вывод) ->
	книга = { 'название': ввод.данные.title, 'сочинитель': ввод.данные.author }
	
	if db('books')._.find_one(книга)?
		throw 'already exists'
	
	проверка = (id) ->
		found = db('books')._.find_one({ id: id })
		return not found?
	
	книга.id = снасти.generate_unique_id(книга.сочинитель + ' «' + книга.название + '»', проверка)
	
	книга = db('books')._.save(книга)
	вывод.send(книга: книга)

http.get '/сеть/книга', (ввод, вывод) ->
	книга = db('books')._.find_one(ввод.данные._id)
	вывод.send(книга: книга)
	
http.get '/сеть/книги/поиск', (ввод, вывод) ->
	шаблон = '.*' + RegExp.escape(ввод.данные.query) + '.*'
	
	книги = db('books')._.find({ название: { $regex: шаблон, $options: 'i' } }, { limit: ввод.данные.max })
	
	Object.выбрать(['_id', 'название', 'сочинитель'], книги)
	
	вывод.send(книги: книги)