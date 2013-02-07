domain = require 'domain'

require 'coffee-script'

require './tools/date'

global.redis = require 'redis'
	
global.mode = 'development'

get_launch_options = ->
	index = process.argv.indexOf('options')
	if (index >= 0)
		return JSON.parse(process.argv[index + 1])

launch_options = get_launch_options()

require './tools/language'

# configuration
global.Options = require "./configuration.coffee"
Object.merge_recursive(global.Options, require "./../../configuration/#{launch_options.server}/configuration.coffee")
require "./../../configuration/#{launch_options.server}/configuration.private.coffee"

global.Options.Version = require "./version.coffee"

# memcache
memcache = require('memcache')
global.memcache = new memcache.Client(Options.Memcache.Port, 'localhost')
global.хранилище = require('mongoskin').db('localhost:' + Options.MongoDB.Port + '/' + Options.MongoDB.Database + '?auto_reconnect=true&safe=true')

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
global.читальня = require './tools/library tools'

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

require './controller/administration'
require './controller/library'
require './controller/people'
require './controller/user'
require './controller/diary'
require './controller/journal'
require './controller/books'
global.новости = require './controller/news'
require './controller/circles'

require './controller/chat'
require './controller/talks'
require './controller/discussions'

global.эфир = require './controller/ether'
require './controller/drafts'
require './controller/system'

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

web_server_domain = domain.create()

web_server_domain.on 'error', (error) ->
	console.error('Application error:')
	console.error('Error', error)
	
web_server_domain.run ->
	global.приложение.listen(Options.Web_server.Port, '0.0.0.0')