http.get '/сеть/читальня/черновики', (ввод, вывод, пользователь) ->
	db('library_article_drafts')._.find({ пользователь: пользователь._id, что: 'заметка' })
	
	пути_к_заметкам = []
	for черновик in черновики
		пути_к_заметкам.add(db('library_paths')._.find_one({ заметка: черновик.заметка }))
	
	for путь in пути_к_заметкам
		for черновик in черновики
			if черновик.заметка + '' == путь.заметка + ''
				черновик.путь_к_заметке = путь.путь

	вывод.send(черновики: черновики)
