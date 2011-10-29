http_client = require('http')

пути = require 'path'
#disk = require 'fs'

лекала = require 'jqtpl'

цепь = require './conveyor'

основа_готова = no
страницы = {}

exports.собрать_и_отдать_страницу = (название, данные, ввод, вывод) ->
	адреса_содержимого = []
	
	if not основа_готова
		адреса_содержимого.push "/лекала/основа.html"
		
	if not страницы[название]?
		адреса_содержимого.push "/страницы/#{название}.html"
		
	цепь()
		.сделать ->
			@ null, адреса_содержимого
			
		.все_вместе (путь_к_файлу) ->
			key = new String(адреса_содержимого.indexOf(путь_к_файлу))
			
			options = 
				host: 'localhost',
				port: 8081,
				path: путь_к_файлу
			
			request = http_client.get options, (response) =>
				headers = JSON.stringify(response.headers)
		
				data = ''
				response
					.on 'data', (chunk) ->
						data += chunk 
						
					.on 'end', =>
						@ null, data
						
			request.on 'error', (error) ->
				@ error
		
		.сделать (данные_страниц) ->
			основа = данные_страниц[0]
			страница = данные_страниц[1]
		
			#if not основа_готова
			лекала.template 'основа', основа
			#основа_готова = yes
			
			if not страницы[название]?
				лекала.template название, страница
				страницы[название] = лекала.tmpl название, данные
				
			данные = 
				название: название
				содержимое: страницы[название]
				
			if ввод.session?
				данные.пользователь = ввод.session.пользователь
				
			вывод.send(лекала.tmpl 'основа', данные)
			
			delete лекала.template['основа']
			delete лекала.template[название]
			#основа_готова = no
			delete страницы[название]
		
		.ошибка (ошибка) ->
			console.error ошибка
			вывод.send ошибка: ошибка