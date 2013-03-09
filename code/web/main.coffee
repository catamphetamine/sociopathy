require 'coffee-script'

require './tools/language'

global.mode = 'development'

get_launch_options = ->
	index = process.argv.indexOf('options')
	if (index >= 0)
		return JSON.parse(process.argv[index + 1])

launch_options = get_launch_options()

# configuration
global.Options = require "./configuration"
Object.merge_recursive(global.Options, require "./../../configuration/#{launch_options.server}/configuration")
require "./../../configuration/#{launch_options.server}/configuration.private"

global.Options.Version = require "./version"

global.disk_tools = require './tools/disk'
require './tools/date'

if Options.Optimize? && Options.Optimize
	require './compressor'

global.redis = require 'redis'
	
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

# conveyor is now superceeded by fiberize
global.Цепь = require './tools/conveyor'
global.цепь = (object, options) ->
	if not object? || typeof object == 'function'
		return new global.Цепь(object, options)

	if object.shouldKeepAlive?
		return new global.Цепь('web', object, options)
		
	if object.namespace? && object.namespace.sockets?
		return new global.Цепь('websocket', object, options)
	
	console.log object
	throw 'Unknown object for conveyor: ' + object

global.fiberize = require './tools/fiberize'
global.снасти = require './tools/tools'
global.пользовательское = require './tools/user tools'

global.хранилище.create = global.хранилище.createCollection.bind_await(global.хранилище)

global.either_way_loading = require './tools/either way loading'

global.application_tools = require('./connect/express')()

global.websocket = require('socket.io').listen приложение

global.image_magick = require 'imagemagick'
global.image_magick.convert.path = Options.ImageMagick.Convert.Path

global.почта = require './tools/email'

global.messages = require './messages/messages'

global.session = require './session'

#global.почта.письмо(кому: 'Николай Кучумов <kuchumovn@gmail.com>', тема: 'Test', сообщение: 'Проверка {{связи}}', данные: { связи: 'связи' })

require './upload server'

# old plugin system. now irrelevant

require './old plugins'

for plugin in global.Options.Old_plugins
	if require('fs').existsSync(__dirname + '/plugins/' + plugin + '.coffee')
		console.log 'Loading plugin: ' + plugin
		require './plugins/' + plugin
		
# old plugin system ends

# new plugin system
require './plugins'

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
	console.error('Application error:')
	console.error('Error', error)
	
web_server_domain.run ->
	global.приложение.listen(Options.Web_server.Port, '0.0.0.0')