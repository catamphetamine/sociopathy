http = require 'http'
util = require 'util'
formidable = require 'formidable'
connect_utilities = require('connect').utils

upload_file = (ввод, возврат) ->
	тайный_ключ_пользователя = снасти.настройки(ввод).user
	if not тайный_ключ_пользователя?
		show_error('Не указан тайный ключ пользователя')
	
	pause = connect_utilities.pause(ввод)
	пользовательское.опознать.await(тайный_ключ_пользователя)
	снасти.создать_путь.await(Options.Upload_server.Temporary_file_path)
	files = monitor_upload.await(ввод, pause)
	file = files[0][1]
	возврат(null, file)

upload_image = (ввод, вывод, настройки) ->
	file = upload_file.await(ввод)
	global.resize.await(file.path, file.path, настройки)
	снасти.переименовать.await(file.path, снасти.имя_файла(file.path) + '.jpg')
	адрес = file.path.to_unix_path().replace(Options.Upload_server.File_path, Options.Upload_server.File_url) + '.jpg'
	console.log({ имя: снасти.имя_файла(file.path), адрес: адрес })
	вывод.send({ имя: снасти.имя_файла(file.path), адрес: адрес })

server = http.createServer (ввод, вывод) ->
	вывод.send = (что) ->
		@writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
		if typeof что == 'object'
			что = JSON.stringify(что)
		@end(что)

	fiber ->
		switch decodeURI(require('url').parse(ввод.url, true).pathname)
			when '/сеть/человек/картинка'
				upload_image(ввод, вывод, { размер: Options.User.Picture.Generic.Size, квадрат: yes })
			when '/сеть/человек/фотография'
				upload_image(ввод, вывод, { размер: Options.User.Photo.Size })
			else
				console.error "URI not found: #{decodeURI(ввод.url)}"
				вывод.writeHead(404, { 'content-type': 'text/plain' })
				return вывод.end('404')

monitor_upload = (ввод, pause, возврат) ->
	form = new formidable.IncomingForm()

	files = []
	fields = []
	
	form.uploadDir = Options.Upload_server.Temporary_file_path
	
	form
		.on 'field', (field, value) ->
			#console.log(field, value)
			fields.add([field, value])
			
		.on 'file', (field, file) ->
			#console.log(field, file)
			files.add([field, file])
	
		.on 'end', ->
			#console.log('-> upload done')
			#console.log(files)
			возврат(null, files)

	form.parse(ввод)
	pause.resume()
	
server.listen(Options.Upload_server.Port)

# convert -resize 120x120 -quality 85 input.jpg output.jpg
# convert -resize 48x48 -quality 85 input.jpg output.jpg

global.resize = (что, во_что, настройки, возврат) ->
	options = 
		srcPath: что
		dstPath: во_что
		quality: 0.85
		strip: false
		filter: 'Lagrange'

	if настройки.квадрат?
		options.width = настройки.размер
		options.height = "#{настройки.размер}^"
		options.customArgs = [
			"-gravity"
			"center"
			"-extent"
			"#{настройки.размер}x#{настройки.размер}"
		]
	else
		options.width = настройки.размер
		options.height = настройки.размер + '>'
		
	image_magick.resize(options, возврат) #(error, output, errors_output) ->