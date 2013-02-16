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
		books.push(db('books')._.find_one({ _id: книга }))
			
	$.книги = books
	вывод.send $