хранилище.bind 'people',
	выбрать: (настройки, возврат) ->
		условия = настройки.условия || {}
		@find(условия, { skip: настройки.с - 1, limit: настройки.сколько }).toArray возврат

http.get '/люди', (ввод, вывод) ->

	настройки =  {}

	if ввод.настройки.раньше == 'true'
		настройки.направление = 'назад'
		настройки.прихватить_границу = no
	else
		настройки.направление = 'вперёд'
		настройки.прихватить_границу = no
		
	цепь(вывод)
		.сделать ->
			if not ввод.настройки.с?
				skip = ввод.настройки.пропустить || 0
				return хранилище.collection('people').find({}, { limit: ввод.настройки.сколько, sort: [['$natural', -1]], skip: skip }).toArray(@.в 'люди')
				
			сравнение_id = {}
			
			if настройки.направление == 'вперёд'
				сравнение_id = '$lte'
			else if настройки.направление == 'назад'
				сравнение_id = '$gte'
		
			if настройки.прихватить_границу == no
				if сравнение_id == '$lte'
					сравнение_id = '$lt'
				else if сравнение_id == '$gte'
					сравнение_id = '$gt'
					
			id_criteria = {}
			id_criteria[сравнение_id] = хранилище.collection('people').id(ввод.настройки.с)
				
			sort = null
			
			if настройки.направление == 'вперёд'
				sort = -1
			else if настройки.направление == 'назад'
				sort = 1
				
			хранилище.collection('people').find({ _id: id_criteria }, { limit: ввод.настройки.сколько, sort: [['$natural', sort]] }).toArray(@.в 'люди')

		.сделать (люди) ->
			return @() if люди.length == 0
			
			more_id_criteria  = {}
			sort = null
			
			if настройки.направление == 'назад'
				more_id_criteria = { $gt: люди[люди.length - 1]._id }
				sort = -1
			else if настройки.направление == 'вперёд'
				more_id_criteria = { $lt: люди[люди.length - 1]._id }
				sort = 1
				
			хранилище.collection('people').find({ _id: more_id_criteria }, { limit: 1, sort: [['$natural', sort]] }).toArray @
		
		.сделать (ещё_люди) ->
			есть_ли_ещё = no
			if ещё_люди.length > 0
				есть_ли_ещё = yes
				
			вывод.send(люди: @.$.люди, 'есть ещё?': есть_ли_ещё)

global.получить_данные_человека = (address_name, вывод, возврат) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findOne { 'адресное имя': address_name }, @

		.сделать (пользователь) ->
			if not пользователь?
				return вывод.send
					ошибка:
						текст: "Пользователь «#{address_name}» не состоит в нашей сети"
						уровень: 'ничего страшного'
				
			возврат null, пользователь

http.get '/человек', (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			global.получить_данные_человека(ввод.настройки.адресное_имя, вывод, @.в '$')
		.сделать ->
			пользовательское.пользователь(ввод, @)
		.сделать (пользователь) ->
			if not пользователь?
				return @.done()
			хранилище.collection('circles').findOne({ пользователь: пользователь._id }, @)
		.сделать (круги) ->
			if not круги?
				return @.done()
				
			круги = круги.круги
			
			for круг, члены of круги
				for член in члены
					if член + '' == @.$._id + ''
						@.$.в_круге = круг
						return @.done()
					
			return @.done()
		.сделать ->
			вывод.send @.$
			
http.get '/человек/картинки/альбомы', (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findOne { 'адресное имя': ввод.настройки['адресное имя'] }, @
		.сделать (человек) ->
			хранилище.collection('pictures').find({ пользователь: человек._id }, { sort: [['$natural', 1]] }).toArray(@)
		.сделать (альбомы) ->
			for альбом in альбомы
				альбом.картинки = []
			вывод.send(альбомы: альбомы)
	
http.get '/человек/картинки/альбом', (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findOne { 'адресное имя': ввод.настройки['адресное имя'] }, @
		.сделать (человек) ->
			хранилище.collection('pictures').findOne({ пользователь: человек._id, id: ввод.настройки.альбом }, @)
		.сделать (альбом) ->
			if not альбом
				return вывод.send(альбом: { картинки: [] })
			вывод.send(альбом: альбом)
			
http.get '/человек/видео/альбомы', (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findOne { 'адресное имя': ввод.настройки['адресное имя'] }, @
		.сделать (человек) ->
			хранилище.collection('videos').find({ пользователь: человек._id }, { sort: [['$natural', 1]] }).toArray(@)
		.сделать (альбомы) ->
			for альбом in альбомы
				альбом.видео = []
			вывод.send(альбомы: альбомы)
		
http.get '/человек/видео/альбом', (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findOne { 'адресное имя': ввод.настройки['адресное имя'] }, @
		.сделать (человек) ->
			хранилище.collection('videos').findOne({ пользователь: человек._id, id: ввод.настройки.альбом }, @)
		.сделать (альбом) ->
			if not альбом
				return вывод.send(альбом: { видео: [] })
			вывод.send(альбом: альбом)
		
http.get '/человек/книги', (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			хранилище.collection('people').findOne { 'адресное имя': ввод.настройки['адресное имя'] }, @
		.сделать (человек) ->
			хранилище.collection('peoples_books').findOne({ пользователь: человек._id }, @)
		.сделать (книги) ->
			if not книги
				return вывод.send(книги: [])
			@.done(книги.книги)
		.все_вместе (книга) ->
			хранилище.collection('books').findOne({ _id: книга }, @)
		.сделать (книги) ->
			вывод.send(книги: книги)