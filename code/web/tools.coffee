http = require 'http'
адрес = require 'url'

Цепочка = require './conveyor'
цепь = (вывод) -> new Цепочка('web', вывод)

снасти = {}

снасти.получить_настройки = (ввод) ->
	настройки = адрес.parse(ввод.url, true).query
	
	for ключ, значение of настройки
		if (typeof значение is 'string')
			if "#{parseInt(значение)}" == значение
				настройки[ключ] = parseInt(значение)
			else if "#{parseFloat(значение)}" == значение
				настройки[ключ] = parseFloat(значение)

	настройки

снасти.отдать_страницу = (название, данные_для_страницы, ввод, вывод) ->
	цепь(вывод)
		.сделать ->
			снасти.получить_страницу(название, данные_для_страницы, ввод, вывод, @)
		.сделать (данные) ->
			вывод.send(данные)
	
снасти.получить_страницу = (название, данные_для_страницы, ввод, вывод, callback) ->
	if ввод.session?
		пользователь = ввод.session.пользователь
		if пользователь?
			данные_для_страницы.пользователь =
				id: пользователь._id,
				имя: пользователь.имя
				'адресное имя': пользователь['адресное имя']
		
	if not callback?
		callback = ->
		
	options = 
		host: 'localhost'
		port: 8082
		path: '/page.sjs' + '?' + 'path=' + encodeURIComponent(название) + '&' + 'data=' + encodeURIComponent(JSON.stringify(данные_для_страницы))
		
	снасти.получить_данные options, callback
	
снасти.получить_данные = (options, callback) ->
	request = http.get options, (response) =>
		#headers = JSON.stringify(response.headers)

		data = ''
		response
			.on 'data', (chunk) ->
				data += chunk 
				
			.on 'end', =>
				callback null, data
				
	request.on 'error', (error) ->
		callback error
		
module.exports = снасти

Array.prototype.is_empty = () ->
	@length == 0
	
Array.prototype.trim = () ->
	array = []
	@forEach (element) ->
		if element?
			array.push element
	array
	
Object.prototype.where_am_i = () ->
	try
		this_variable_doesnt_exist['you are here'] += 0
	catch error
		console.log error.stack