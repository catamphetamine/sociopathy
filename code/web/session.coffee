redis = require 'redis'

default_options =
	host: '127.0.0.1'
	port: '6379'
#	time_to_live: 60 * 60 /* an hour (in seconds) */

options = снасти.merge(default_options, {})

prefix = 'session:'

client = new redis.createClient(options.port || options.socket, options.host, options)

###
# if using these, add something like 'global.session_store_initialized()', so that it initializes before running the web server

if options.password?
	client.auth options.password, (error) ->
		if error?
			throw error

if options.db?
	client.select(options.db)
	client.on "connect", () ->
		client.send_anyways = true
		client.select(options.db)
		client.send_anyways = false
###

exports.get = (id, key, возврат) ->
	if typeof key == 'function'
		возврат = key
		key = null
		
	new Цепочка(возврат)
		.сделать ->
			client.get(prefix + id, @)
		.сделать (data) ->
			if not data?
				return @.return()
			data = JSON.parse(data.toString())
			if key?
				data = data[key]
			@.return(data)
			
exports.set = (id, extra_data, возврат) ->
	multi = client.multi()

	new Цепочка(возврат)
		.сделать ->
			multi.get(prefix + id, @)
			
		.сделать (data) ->
			if data?
				data = JSON.parse(data.toString())
			else
				data = {}
				
			data = Object.merge_recursive(data, extra_data)
			data = JSON.stringify(data)
		
			if options.time_to_live?
				multi.setex(prefix + id, options.time_to_live, data)
			else
				multi.set(prefix + id, data)
		
			multi.exec(@)
		
exports.delete = (id, возврат) ->	
	client.del(prefix + id, возврат)