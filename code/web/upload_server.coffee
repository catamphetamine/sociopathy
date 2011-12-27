http = require 'http'
адрес = require 'url'
util = require 'util'
formidable = require 'formidable'
connect_utilities = require('connect').utils

снасти = require './tools'
пользовательское = require './user_tools'

global.Upload_server_port = 8090

file_path = 'c:\\work\\sociopathy\\загруженное'

server = http.createServer (ввод, вывод) ->
	вывод.send = (что) ->
		@writeHead(200, {'content-type': 'text/html'})
		if typeof что == 'object'
			что = JSON.stringify(что)
		@end(что)

	switch decodeURI(адрес.parse(ввод.url, true).pathname)
		when '/человек/сменить картинку'
			номер_пользователя = снасти.настройки(ввод).user
			if not номер_пользователя?
				ошибка = 'Не указан номер пользователя'
				console.error ошибка
				return вывод.send(ошибка: ошибка)
			
			приостановленный_ввод = connect_utilities.pause(ввод)
			пользовательское.получить_пользователя номер_пользователя, вывод, (ошибка, пользователь) ->
				if ошибка?
					пользовательское.выйти(ввод, вывод)
					console.error ошибка
					return вывод.send(ошибка: ошибка)
					
				options =
					file_path: file_path + '\\люди\\' + пользователь['адресное имя'] + '\\картинка'
					file_name: 'на личной карточке.jpg'
				
				снасти.создать_путь(options.file_path, (ошибка) ->
					if ошибка?
						console.error ошибка
						return вывод.send(ошибка: ошибка)
					
					upload(options, ввод, (files) ->
						file = files[0]
						file = file[1]
						снасти.переименовать(file.path, options.file_name, (ошибка) ->
							if ошибка?
								console.error ошибка
								return вывод.send(ошибка: ошибка)
								
							вывод.send {}
						)
					)
					приостановленный_ввод.resume()
				)
		else
			console.error "URI not found: #{decodeURI(ввод.url)}"
			вывод.writeHead(404, { 'content-type': 'text/plain' })
			return вывод.end('404')

upload = (options, ввод, возврат) ->
	form = new formidable.IncomingForm()

	files = []
	fields = []
	
	form.uploadDir = options.file_path
	
	form
		.on 'field', (field, value) ->
			#console.log(field, value)
			fields.push([field, value])
			
		.on 'file', (field, file) ->
			#console.log(field, file)
			files.push([field, file])
	
		.on 'end', ->
			#console.log('-> upload done')
			возврат(files)

	form.parse(ввод)
	
server.listen(global.Upload_server_port)