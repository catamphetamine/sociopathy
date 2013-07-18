require 'coffee-script'

global.Started_at = new Date()

global.Root_folder = __dirname + '/../..'

require './tools/language'

global.mode = 'development'

get_launch_options = ->
	index = process.argv.indexOf('options')
	if (index >= 0)
		return JSON.parse(process.argv[index + 1])

launch_options = get_launch_options()
 
global.fiberize = require './tools/fiberize'

global.disk_tools = require './tools/disk'

fiber ->
	# configuration
	global.Options = require "./configuration"
	
	Object.merge_recursive(global.Options, require "./../../configuration/#{launch_options.server}/configuration")
	
	private_configuration = "./../../configuration/#{launch_options.server}/configuration.private"
	
	if global.disk_tools.exists(private_configuration)
		require private_configuration
	
	global.Options.Upload_server.Temporary_file_path = global.Options.Upload_server.File_path + '/временное'
	
	global.Options.Version = require "./version"
	
	require './tools/date'

	try
		require('./tools/cpu').watch()
		
		if Options.Optimize
			require './compressor'
		
		global.redis = require 'redis'
	
		# clear all the presence user lists (if the application was terminated the corresponding redis keys weren't updated)
		redis = global.redis.createClient()
		for presence_list in redis.keys.bind_await(redis)('*:connected')
			redis.del.bind_await(redis)(presence_list)
		
		# memcache
		memcache = require('memcache')
		global.memcache = new memcache.Client(Options.Memcache.Port, 'localhost')
		
		mongo_db = require './tools/mongo db'
		
		mongo_db_options =
			server:
				host: 'localhost'
				port: Options.MongoDB.Port
				auto_reconnect: yes
			database:
				name: Options.MongoDB.Database
				safe: yes
			
		global.хранилище = mongo_db.open(mongo_db_options)
	
		global.снасти = require './tools/tools'
		global.пользовательское = require './tools/user tools'
	
		global.хранилище.create = global.хранилище.createCollection.bind_await(global.хранилище)
		
		global.either_way_loading = require './tools/either way loading'
		
		global.Activity = require './core/activity'

		global.application_tools = require('./connect/express')()
		
		global.websocket = require('socket.io').listen(http_server)
		
		if not Options.Development
			global.websocket.enable('browser client minification')  # send minified client
			global.websocket.enable('browser client etag')          # apply etag caching logic based on version number
			global.websocket.enable('browser client gzip')          # gzip the file
			global.websocket.set('log level', 1)                    # reduce logging
		
		global.websocket.set('transports', [ 'websocket', 'xhr-polling' ])

		global.image_magick = require 'imagemagick'
		global.image_magick.convert.path = Options.ImageMagick.Convert.Path
		
		global.почта = require './tools/email'
		
		global.messages = require './core/messages/messages'
		
		global.session = require './session'
		
		#global.почта.письмо(кому: 'Николай Кучумов <kuchumovn@gmail.com>', тема: 'Test', сообщение: 'Проверка {{связи}}', данные: { связи: 'связи' })
		
		require './upload server'
		
		require './core/system'
		require './core/user'
		require './core/ether'
		require './core/drafts'
		require './core/news'
		
		# plugin system
		require './plugins'
	
		require './international'
		
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
		
		#global.memcache.connect()
		
		web_server_domain = require('domain').create()
		
		web_server_domain.on 'error', (error) ->
			ошибка(ошибка: error)
			
		web_server_domain.run ->
			http_server.listen(Options.Web_server.Port, '0.0.0.0')
	catch error
		console.error('Error:')
		console.error(error)