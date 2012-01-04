http = require 'http'
util = require 'util'
formidable = require 'formidable'
connect_utilities = require('connect').utils

server = http.createServer (ввод, вывод) ->
	вывод.send = (что) ->
		@writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
		if typeof что == 'object'
			что = JSON.stringify(что)
		@end(что)

	switch decodeURI(require('url').parse(ввод.url, true).pathname)
		when '/человек/сменить картинку'
			номер_пользователя = снасти.настройки(ввод).user
			if not номер_пользователя?
				ошибка = 'Не указан номер пользователя'
				console.error ошибка
				return вывод.send(ошибка: ошибка)
			
			приостановленный_ввод = connect_utilities.pause(ввод)
			пользовательское.получить_пользователя номер_пользователя, (ошибка, пользователь) ->
				if ошибка?
					пользовательское.выйти(ввод, вывод)
					console.error ошибка
					return вывод.send(ошибка: ошибка)
					
				снасти.создать_путь(Options.Upload_server.Temporary_file_path, (ошибка) ->
					if ошибка?
						console.error ошибка
						return вывод.send(ошибка: ошибка)
					
					upload(ввод, (files) ->
						file = files[0]
						file = file[1]
						снасти.переименовать(file.path, снасти.имя_файла(file.path) + '.jpg', (ошибка) ->
							if ошибка?
								console.error ошибка
								return вывод.send(ошибка: ошибка)
								
							адрес = file.path.to_unix_path().replace(Options.Upload_server.Upload_file_path, Options.Upload_server.File_url) + '.jpg'
							вывод.send { имя: снасти.имя_файла(file.path), адрес: адрес }
						)
					)
					приостановленный_ввод.resume()
				)
		else
			console.error "URI not found: #{decodeURI(ввод.url)}"
			вывод.writeHead(404, { 'content-type': 'text/plain' })
			return вывод.end('404')

upload = (ввод, возврат) ->
	form = new formidable.IncomingForm()

	files = []
	fields = []
	
	form.uploadDir = Options.Upload_server.Temporary_file_path
	
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
	
server.listen(Options.Upload_server.Port)