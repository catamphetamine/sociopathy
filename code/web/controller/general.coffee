хранилище = global.db
http = global.application_tools.http
цепь = require './../web_conveyor'

снасти = require './../tools'

http.get '/общие_данные_для_страницы', (ввод, вывод) ->
	данные_для_страницы = {}
	
	if ввод.session?
		пользователь = ввод.session.data.пользователь
		данные_для_страницы.пользователь =
			id: пользователь._id,
			имя: пользователь.имя
			'адресное имя': пользователь['адресное имя']
	else
		if ввод.cookies.user?
			вывод.clearCookie 'user'
			данные_для_страницы.ошибка = 'Пользователь не найден'
		
	вывод.send данные_для_страницы
	
страницы =
[
	'люди',
	'прописка',
	'сеть/настройки',
	'сеть/болталка',
	'сеть/обсуждения',
	'сеть/беседы',
	'сеть/почта',
	'обложка',
	'помощь',
	'помощь/режимы',
	'заметка',
	'читальня',
	'управление'
]

страницы.forEach (страница) ->
	http.get "/страница/#{страница}", (ввод, вывод) ->
		цепь(вывод)
			.сделать ->
				снасти.отдать_страницу страница, {}, ввод, вывод
	
http.get "/страница/люди/:address_name", (ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			снасти.отдать_страницу 'человек', {}, ввод, вывод
			
http.get "/страница/читальня/*", (ввод, вывод) ->
	путь = ввод.params[0]
	return if путь.length == 0
	
	цепь(вывод)
		.сделать ->
			снасти.отдать_страницу 'читальня', {}, ввод, вывод, @