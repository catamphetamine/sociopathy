http = require 'http'
адрес = require 'url'
connect_utilities = require('connect').utils

Цепочка = require './conveyor'
цепь = require './web_conveyor'

memcache = global.memcache

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

снасти.отдать_страницу = (название, данные_для_страницы, ввод, вывод, возврат) ->
	new Цепочка()
		.сделать ->
			memcache.get название, @
			
		.сделать (данные) ->
			if not данные?
				return @()
			вывод.send данные

		.сделать ->
			снасти.получить_страницу(название, данные_для_страницы, ввод, вывод, @.в 'данные')

		.сделать (данные) ->
			memcache.set название, данные, @, 60 * 60
			
		.сделать (данные) ->
			вывод.send @.переменная 'данные'
			
		.ошибка (ошибка) ->
			возврат ошибка
	
снасти.получить_страницу = (название, данные_для_страницы, ввод, вывод, callback) ->
	options = 
		host: 'localhost'
		port: 8082
		path: '/page.sjs' + '?' + 'path=' + encodeURIComponent(название) + '&' + 'data=' + encodeURIComponent(JSON.stringify(данные_для_страницы))
	
	снасти.получить_данные options, callback
	
снасти.hash = (что, чем, callback) ->
	options = 
		host: 'localhost'
		port: 8082
		path: '/hash.sjs' + '?' + 'value=' + encodeURIComponent(что) + '&' + 'method=' + 'whirlpool'
		
	снасти.получить_данные options, callback
	
снасти.получить_данные = (options, callback) ->
	if not callback?
		callback = ->
		
	#console.log 'fetching ' + options.path
	#console.log 'started on ' + new Date().getTime()
	
	request = http.get options, (response) =>
		#headers = JSON.stringify(response.headers)
		
		data = ''
		response
			.on 'data', (chunk) ->
				data += chunk 
				
			.on 'end', =>
				#console.log 'fetched ' + options.path
				#console.log 'ended   on ' + new Date().getTime()
				
				callback null, data
				
	request.on 'error', (error) ->
		callback error
		
снасти.приостановить_ввод = (ввод, следующий) ->
	pause = connect_utilities.pause ввод

	return (ошибка) ->
		следующий(ошибка)
		pause.resume()
		
снасти.merge = (first, second) ->
	result = {}
	for own key, value of first
		result[key] = value
	for own key, value of second
		result[key] = value
	result
	
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