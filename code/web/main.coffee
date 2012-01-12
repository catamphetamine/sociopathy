require 'coffee-script'
global.redis = require 'redis'
	
global.mode = 'development'

get_launch_options = ->
	index = process.argv.indexOf('options')
	if (index >= 0)
		return JSON.parse(process.argv[index + 1])

launch_options = get_launch_options()

if launch_options.server == 'home'
	Upload_server_file_path = 'c:/work/sociopathy/загруженное'
	
	global.Options =
		Web_server:
			Port: 8080
		Upload_server:
			Port: 8090
			File_path: Upload_server_file_path
			File_url: '/загруженное'
			Temporary_file_path: Upload_server_file_path + '/временное'
		Memcache:
			Port: 11211
		MongoDB:
			Port: 27017
			Database: 'sociopathy'
		User:
			Session:
				Redis:
					Prefix: 'website_session:'
			Picture:
				Generic:
					Size: 120
				Chat:
					Size: 48
		ImageMagick:
			Convert:
				Path: 'C:/Program Files (x86)/ImageMagick-6.7.4-Q16/convert'
else if launch_options.server == 'grimbit'
	Upload_server_file_path = 'c:/work/sociopathy/загруженное'
	
	global.Options =
		Web_server:
			Port: 8080
		Upload_server:
			Port: 8090
			File_path: Upload_server_file_path
			File_url: '/загруженное'
			Temporary_file_path: Upload_server_file_path + '/временное'
		Memcache:
			Port: 11211
		MongoDB:
			Port: 27017
			Database: 'sociopathy'
		User:
			Session:
				Redis:
					Prefix: 'website_session:'
			Picture:
				Generic:
					Size: 120
				Chat:
					Size: 48
		ImageMagick:
			Convert:
				Path: 'C:/Program Files (x86)/ImageMagick-6.7.4-Q16/convert'
				
memcache = require('memcache')
global.memcache = new memcache.Client(global.Options.Memcache.Port, 'localhost')
global.хранилище = require('mongoskin').db('localhost:' + global.Options.MongoDB.Port + '/' + global.Options.MongoDB.Database + '?auto_reconnect')

global.Цепочка = require './tools/conveyor'
global.цепь = (вывод) -> new global.Цепочка('web', вывод)
global.цепь_websocket = (соединение) -> new global.Цепочка('websocket', соединение)

global.снасти = require './tools/tools'
global.пользовательское = require './tools/user_tools'

global.application_tools = require('./connect/express')()
global.http = global.application_tools.http

global.websocket = require('socket.io').listen приложение

global.image_magick = require 'imagemagick'
global.image_magick.convert.path = Options.ImageMagick.Convert.Path

require './tools/date'

require './upload_server'

require './controller/administration'
require './controller/chat'
require './controller/library'
require './controller/people'
require './controller/user'
require './controller/general'

#global.memcache_available = false
global.memcache.on 'connect', () ->
	global.memcache_available = true

global.memcache.on 'timeout', () ->
	# no arguments - socket timed out
	console.error 'Memcache connection timeout'

global.memcache.on 'error', (error) ->
	# there was an error - exception is 1st argument
	console.error 'Memcache failed:'
	console.error error

global.memcache.connect()
	
new Цепочка()	
	.сделать ->
		global.redis.createClient().del('chat:online', @)
	.сделать ->					
		global.приложение.listen global.Options.Web_server.Port, '0.0.0.0'