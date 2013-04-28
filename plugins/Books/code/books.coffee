хранилище.create_collection('books', [['id', yes], [[[ 'сочинитель', 1 ], [ 'название', 1 ]], yes]])
хранилище.create_collection('peoples_books', [['пользователь', yes]])
		
http.get '/сеть/книги', (ввод, вывод) ->
	options =
		collection: 'books'
		query: {},
		total: yes
	
	result = either_way_loading(ввод, options)
	
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

http.post '/сеть/книги', (ввод, вывод, пользователь) ->
	книги = JSON.parse(ввод.данные.книги)
	
	# проверить уникальность пар "автор / название" для переименованных
	
	for книга in книги.переименованные
		key = { сочинитель: книга.сочинитель, название: книга.название }
		
		if db('books')._.find_one(key)?
			throw 'У двух книг совпадают автор и название: ' + книга.сочинитель + ' «' + книга.название + '»'
	
	# проверить недобавленность удалённых книг
	
	for книга in книги.удалённые
		_id = db('books').id(книга)
		
		у_кого = db('peoples_books')._.find_one({ книги: { $in: [_id] } })
		
		if у_кого?
			держатель = пользовательское.взять.await(у_кого.пользователь)
			книга = db('books')._.find_one(_id)
			throw 'Книга ' + книга.сочинитель + ' «' + книга.название + '» не может быть удалена, потому что она стоит в книжном шкафу у пользователя ' + держатель.имя
		
	# удалить удалённые книги

	for книга in книги.удалённые
		_id = db('books').id(книга)
		
		книга = db('books')._.find_one(_id)
				
		system_trash('книга', { книга: книга }, пользователь)
				
		db('books')._.remove({ _id: _id })
	
	# обновить обновлённые обложки книг

	for книга in книги.обновлённые_обложки
		_id = db('books').id(книга._id)
		
		обложка = JSON.parse(книга.обложка)
		
		small_to_big_ratio = Options.Books.Cover.Small.Height / Options.Books.Cover.Big.Height
		
		small_size =
			width: parseInt(обложка.ширина * small_to_big_ratio)
			height: parseInt(обложка.высота * small_to_big_ratio)
		
		options =
			временное_название: обложка.имя
			место: '/книги/' + книга._id + '/обложки'
			название: 'большая'
			extra_sizes: { 'маленькая': { ширина: Options.Books.Cover.Small.Width, высота: Options.Books.Cover.Small.Height } }
	
		finish_picture_upload(options)
		
		update =
			'обложка.большая.ширина': обложка.ширина
			'обложка.большая.высота': обложка.высота
			'обложка.маленькая.ширина': small_size.width
			'обложка.маленькая.высота': small_size.height
			'обложка.формат': 'jpg'
				
		db('books')._.update({ _id: _id }, { $inc: { 'обложка.version': 1 }, $set: update })

	# переименовать переименованные	книги
		
	for книга in книги.переименованные
		_id = db('books').id(книга._id)
		db('books')._.update({ _id: _id }, { $set: { название: книга.название, сочинитель: книга.сочинитель } })
			
	# всё
	
	вывод.send({})