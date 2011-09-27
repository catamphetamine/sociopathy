express = require 'express'
приложение = express.createServer()

mongo = require 'mongoskin'
хранилище = mongo.db 'localhost:27017/sociopathy'

выполнить = require 'seq'
http = require('./express')(приложение).http

require 'coffee-script'
лекальщик = require './templater'

http.put '/прописать', (ввод, вывод) ->
	выполнить()
		.seq ->
			хранилище.collection('people').save(ввод.body, this)
		
		.catch (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка
			break: true
			
		.seq (пользователь) ->
			вывод.send ключ: пользователь._id

http.get '/люди', (ввод, вывод) ->
	выполнить()
		.seq ->
			#ввод.body.с
			#ввод.body.сколько
			
			хранилище.collection('people').find().toArray(this)
		
		.catch (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка
			break: true
		
		.seq (люди) ->
			вывод.send люди: люди, 'есть ещё?': no

страницы = ['physics', 'люди', 'настройки', 'почта', 'обложка', 'помощь', 'статья', 'читальня']

страницы.forEach (страница) ->
	http.get "/страница/#{страница}", (ввод, вывод) ->
		лекальщик.собрать_и_отдать_страницу(страница, вывод)

приложение.listen 8080, '0.0.0.0'