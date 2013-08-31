http = require 'http'
util = require 'util'
formidable = require 'formidable'
connect_utilities = require('connect').utils

upload_file = (ввод, возврат) ->
	тайный_ключ_пользователя = снасти.данные(ввод).user
	if not тайный_ключ_пользователя?
		throw 'Не указан тайный ключ пользователя'
	
	pause = connect_utilities.pause(ввод)
	пользовательское.опознать.do(тайный_ключ_пользователя)
	снасти.создать_путь.do(Options.Upload_server.Temporary_file_path)
	files = monitor_upload.do(ввод, pause)
	file = files[0][1]
	возврат(null, file)

upload_image = (ввод, вывод, настройки) ->
	file = upload_file.do(ввод)
	test = global.resize.do(file.path, file.path, настройки)
	снасти.переименовать.do(file.path, снасти.имя_файла(file.path) + '.jpg')
	адрес = file.path.to_unix_path().replace(Options.Upload_server.File_path, Options.Upload_server.File_url) + '.jpg'
	вывод.send({ имя: снасти.имя_файла(file.path), адрес: адрес })

actions = {}

actions['/сеть/книга/обложка'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { ширина: Options.Books.Cover.Big.Width, высота: Options.Books.Cover.Big.Height })

actions['/сеть/человек/картинка'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { размер: Options.User.Picture.Generic.Size })

actions['/сеть/читальня/раздел/картинка'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { crop: yes, ширина: Options.Library.Category.Icon.Generic.Width, высота: Options.Library.Category.Icon.Generic.Height })
	
actions['/сеть/человек/фотография'] = (ввод, вывод) ->
	upload_image(ввод, вывод, { наибольший_размер: Options.User.Photo.Size })
		
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

	options.customArgs = []
	
	# gravitate to center (must precede the -extent setting)
	options.customArgs.add('-gravity')
	options.customArgs.add('center')
	
	if настройки.наибольший_размер?
		# уменьшить, если слишком большое
		options.width = настройки.наибольший_размер
		options.height = настройки.наибольший_размер + '>'
	else if настройки.размер?
		# заполнить как минимум весь размер
		options.width = настройки.размер
		options.height = настройки.размер + '^'
			
		# протяжённость, для сохранения aspect ratio
		options.customArgs.add('-extent')
		options.customArgs.add(настройки.размер + 'x' + настройки.размер)
	else
		options.width = настройки.ширина
			
		if not настройки.crop?
			options.height = настройки.высота + '>'
		else	
			options.height = настройки.высота + '^'
		
		# протяжённость, для выравнивания по высоте по середине
		options.customArgs.add('-extent')
		options.customArgs.add(настройки.ширина + 'x' + настройки.высота)
	
	image_magick.resize(options, возврат) #(error, output, errors_output) ->
	
global.finish_picture_upload = (options) ->
	временное_название = options.временное_название.to_unix_file_name()
	путь = Options.Upload_server.Temporary_file_path + '/' + временное_название + '.jpg'

	место = Options.Upload_server.File_path + options.место
	снасти.создать_путь.do(место)
	
	if options.extra_sizes?
		for name, sizing of options.extra_sizes
			resize.do(путь, место + '/' + name + '.jpg', sizing)
			
	снасти.переместить_и_переименовать.do(путь, { место: место, имя: options.название + '.jpg' })