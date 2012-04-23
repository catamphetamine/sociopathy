require 'coffee-script'
global.redis = require 'redis'
	
global.mode = 'development'

get_launch_options = ->
	index = process.argv.indexOf('options')
	if (index >= 0)
		return JSON.parse(process.argv[index + 1])

launch_options = get_launch_options()

require "./../../configuration/#{launch_options.server}/configuration.coffee"
require "./../../configuration/#{launch_options.server}/configuration.private.coffee"

memcache = require('memcache')
global.memcache = new memcache.Client(Options.Memcache.Port, 'localhost')
global.хранилище = require('mongoskin').db('localhost:' + Options.MongoDB.Port + '/' + Options.MongoDB.Database + '?auto_reconnect')

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

global.почта = require './tools/email'

#global.почта.письмо(кому: 'Николай Кучумов <kuchumovn@gmail.com>', тема: 'Test', сообщение: 'Проверка {{связи}}', данные: { связи: 'связи' })

require './tools/date'

require './upload_server'

require './controller/administration'
require './controller/chat'
require './controller/library'
require './controller/people'
require './controller/user'
require './controller/general'
require './controller/blog'
require './controller/books'
require './controller/friends'
require './controller/websocket'

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
		global.приложение.listen Options.Web_server.Port, '0.0.0.0'