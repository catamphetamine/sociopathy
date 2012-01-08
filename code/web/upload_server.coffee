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
			тайный_ключ_пользователя = снасти.настройки(ввод).user
			if not тайный_ключ_пользователя?
				ошибка = 'Не указан тайный ключ пользователя'
				console.error ошибка
				return вывод.send(ошибка: ошибка)
			
			приостановленный_ввод = connect_utilities.pause(ввод)
			
			file = null
			цепь(вывод)
				.сделать ->
					пользовательское.опознать(тайный_ключ_пользователя, @)
				.сделать (пользователь) ->
					снасти.создать_путь(Options.Upload_server.Temporary_file_path, @)
				.сделать ->
					monitor_upload(ввод, @)
					приостановленный_ввод.resume()
				.сделать (files) ->
					file = files[0][1]
					global.square_resize(file.path, file.path, Options.User.Picture.Generic.Size, @)
				.сделать ->
					снасти.переименовать(file.path, снасти.имя_файла(file.path) + '.jpg', @)
				.сделать ->
					адрес = file.path.to_unix_path().replace(Options.Upload_server.File_path, Options.Upload_server.File_url) + '.jpg'
					вывод.send { имя: снасти.имя_файла(file.path), адрес: адрес }
		else
			console.error "URI not found: #{decodeURI(ввод.url)}"
			вывод.writeHead(404, { 'content-type': 'text/plain' })
			return вывод.end('404')

monitor_upload = (ввод, возврат) ->
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
			возврат(null, files)

	form.parse(ввод)
	
server.listen(Options.Upload_server.Port)

# convert -resize 120x120 -quality 85 input.jpg output.jpg
# convert -resize 48x48 -quality 85 input.jpg output.jpg

global.square_resize = (что, во_что, размер, возврат) ->
	options = 
		srcPath: что
		dstPath: во_что
		quality: 0.85
		strip: false
		width: размер
		height: "#{размер}^"
		filter: 'Lagrange'
		customArgs: [
			"-gravity"
			"center"
			"-extent"
			"#{размер}x#{размер}"
		]
	
	image_magick.resize(options, возврат) #(error, output, errors_output) ->