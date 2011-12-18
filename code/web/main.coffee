require 'coffee-script'

mongo = require 'mongoskin'
хранилище = mongo.db 'localhost:27017/sociopathy?auto_reconnect'
global.db = хранилище

Цепочка = require './conveyor'
цепь = (вывод) -> new Цепочка('web', вывод)

global.application_tools = require('./express')()
http = global.application_tools.http

приложение = global.application

снасти = require './tools'

require './date'

require './controller/administration'
require './controller/chat'
require './controller/library'
require './controller/people'
require './controller/user'

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
	'physics',
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

приложение.listen 8080, '0.0.0.0'