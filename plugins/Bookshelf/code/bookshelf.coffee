http.get '/человек/книги', (ввод, вывод) ->
	человек = пользовательское.взять.do({ id: ввод.данные.id })
	
	$ = {}
			
	$.пользователь = { имя: человек.имя }
	книги = db('peoples_books').get(пользователь: человек._id)
	
	if not книги?
		return вывод.send(книги: [])
	
	books = []
	for книга in книги.книги.reverse()
		books.add(db('books').get(книга))
			
	$.книги = books
	вывод.send $
	
http.put '/сеть/книжный шкаф', (ввод, вывод, пользователь) ->
	книга = db('books').get(ввод.данные._id)
	
	books = db('peoples_books').get(пользователь: пользователь._id)
	if not books?
		db('peoples_books').add({ пользователь: пользователь._id, книги: [] })
		
	db('peoples_books').update({ пользователь: пользователь._id }, { $addToSet: { книги: книга._id } })
	
	вывод.send {}
	
http.delete '/сеть/книжный шкаф', (ввод, вывод, пользователь) ->
	книга = db('books').get(ввод.данные._id)
	
	db('peoples_books').update({ пользователь: пользователь._id }, { $pull: { книги: книга._id } })
	
	вывод.send {}