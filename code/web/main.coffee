require 'coffee-script'

express = require 'express'
приложение = express.createServer()

mongo = require 'mongoskin'
хранилище = mongo.db 'localhost:27017/sociopathy?auto_reconnect'

выполнить = require 'seq'
http = require('./express')(приложение).http

лекальщик = require './templater'
снасти = require './tools'

хранилище.bind 'people',
	выбрать: (настройки, возврат) ->
		условия = настройки.условия || {}
		@find(условия, { skip: настройки.с - 1, limit: настройки.сколько }).toArray возврат

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
			хранилище.collection('people').выбрать({ с: ввод.настройки.с, сколько: ввод.настройки.сколько }, @into 'люди')

		.catch (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка
			break: true

		.seq ->
			хранилище.collection('people').count(@into 'поголовье')
		
		.catch (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка
			break: true
			
		.seq ->
			есть_ли_ещё = @vars.поголовье > (ввод.настройки.с - 1 + ввод.настройки.сколько)
			вывод.send люди: @vars.люди, 'есть ещё?': есть_ли_ещё 

http.get '/приглашение/проверить', (ввод, вывод) ->
	выполнить()
		.seq ->
			хранилище.collection('invites').findOne({ 'key': ввод.настройки.приглашение }, this)
		
		.catch (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка
			break: true
		
		.seq (приглашение) ->
			вывод.send { приглашение: приглашение}
			
http.get '/хранилище/заполнить', (ввод, вывод) ->
	выполнить()
		.seq ->
			хранилище.collection('people').drop(this)
		
		.catch (ошибка) ->
			if ошибка.message != 'ns not found'
				console.error ошибка
				вывод.send ошибка: ошибка
				break: true

		.seq ->
			man = 
				имя: 'Иванов Иван' 
				описание: 'заведующий'
				пол: 'мужской'
				откуда: 'Москва'
				'время рождения': '12.09.1990'
				вера: 'христианин'
				убеждения: 'социалист' 
				картинка: '/картинки/temporary/картинка с личной карточки.jpg'
				
			хранилище.collection('people').save(man, this)
		
		.seq ->
			хранилище.collection('invites').drop(this)
		
		.catch (ошибка) ->
			if ошибка.message != 'ns not found'
				console.error ошибка
				вывод.send ошибка: ошибка
				break: true
				
		.seq ->
			хранилище.collection('invites').save({ key: 'проверка' }, this)
		
		.catch (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка
			break: true
		
		.seq (приглашение) ->
			вывод.send {}
			
страницы = ['physics', 'люди', 'настройки', 'почта', 'прописка', 'беседка', 'обложка', 'помощь', 'статья', 'читальня', 'управление']

страницы.forEach (страница) ->
	http.get "/страница/#{страница}", (ввод, вывод) ->
		лекальщик.собрать_и_отдать_страницу(страница, вывод)

приложение.listen 8080, '0.0.0.0'