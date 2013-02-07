redis = require 'redis'

default_options =
	host: '127.0.0.1'
	port: '6379'
#	time_to_live: 60 * 60 /* an hour (in seconds) */

options = снасти.merge(default_options, {})

prefix = 'session:'

client = new redis.createClient(options.port || options.socket, options.host, options)

exports.get = (id, key, возврат) ->
	if typeof key == 'function'
		возврат = key
		key = null
		
	data = client.get.bind_await(client)(prefix + id)
	
	if not data?
		return возврат()
	
	data = JSON.parse(data.toString())
	if key?
		data = data[key]
		
	возврат(null, data)
	
exports.set = (id, extra_data, возврат) ->
	multi = client.multi()

	data = multi.get.bind_await(multi)(prefix + id)
			
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

	multi.exec(возврат)
		
exports.delete = (id, возврат) ->	
	client.del(prefix + id, возврат)