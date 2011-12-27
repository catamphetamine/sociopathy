require 'coffee-script'

memcache = require 'memcache'
global.memcache = new memcache.Client 11211, 'localhost'

mongo = require 'mongoskin'
хранилище = mongo.db 'localhost:27017/sociopathy?auto_reconnect'
global.db = хранилище

Цепочка = require './conveyor'
цепь = (вывод) -> new Цепочка('web', вывод)

global.application_tools = require('./express')()
http = global.application_tools.http

приложение = global.application

снасти = require './tools'

require './date'

require './upload_server'

require './controller/administration'
require './controller/chat'
require './controller/library'
require './controller/people'
require './controller/user'
require './controller/general'

#global.websocket = require('socket.io').listen 8084
		
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
	
приложение.listen 8080, '0.0.0.0'
global.memcache.connect()