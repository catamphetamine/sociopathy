http = require 'http'
util = require 'util'
formidable = require 'formidable'
connect_utilities = require('connect').utils

upload_file = (ввод, возврат) ->
	тайный_ключ_пользователя = снасти.данные(ввод).user
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
	вывод.send({ имя: снасти.имя_файла(file.path), адрес: адрес })

actions = {}

actions['/сеть/человек/картинка'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { размер: Options.User.Picture.Generic.Size, квадрат: yes })

actions['/сеть/читальня/раздел/картинка'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { размер: Options.Library.Category.Icon.Size, квадрат: yes })
	
actions['/сеть/человек/фотография'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { размер: Options.User.Photo.Size })
		
server = fiberize.http_server(actions)

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
	
global.finish_picture_upload = (options) ->
	временное_название = options.временное_название.to_unix_file_name()
	путь = Options.Upload_server.Temporary_file_path + '/' + временное_название + '.jpg'

	место = Options.Upload_server.File_path + options.место
	снасти.создать_путь.await(место)
	
	if options.sizes?
		for name, sizing of options.sizes
			resize.await(путь, место + '/' + name + '.jpg', sizing)
			
	снасти.переместить_и_переименовать.await(путь, { место: место, имя: options.название + '.jpg' })