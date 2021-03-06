# requires 'node-sync' and 'node-fibers'
global.Fiber = require 'fibers'
sync = require 'sync'

global.fiber = (action) ->
	wrapped_action = ->
		try
			action()
		catch error	
			if error.stack?
				console.error(error.stack)
			else
				console.error(error)
				
			throw error

	sync(wrapped_action)

fiber = global.fiber

Function.prototype.do = ->
	parameters = Array.prototype.slice.call(arguments)
	@fiberize(@).apply(@, parameters)

Function.prototype.fiberize = (binding) ->
	return =>
		parameters = Array.prototype.slice.call(arguments)
		# add binding as a first argument
		parameters.unshift(binding)
		@sync.apply(@, parameters)

exports.express_action = (action, url, input, output) ->
	action(input, output)

parse_error = (error) ->
	console.log '=========================== Error ============================'

	if error.stack?
		console.log error.stack
	else
		console.log error
		
	console.log '=============================================================='
	
	if error.message?
		return error.message
	
	if typeof error == 'string'
		return error
		
	return error #JSON.stringify(error)
		
exports.express = (application) ->
	global.http = {}
	
	['get', 'post', 'put', 'delete'].forEach (method) ->
		global.http[method] = (url, action) ->
			enhanced_action = (input, output) ->
				fiber ->
					try
						exports.express_action(action, url, input, output)
					catch error
						console.log('Http action error:')
						output.send(error: parse_error(error), debug: error.stack)
						
			application[method](encodeURI(url), enhanced_action)
			
exports.websocket = (socket) ->
	if socket.fiber_injected?
		return
		
	socket.fiber_injected = yes
	
	socket.old_on = socket.on
	
	socket.on = (message_type, action) ->
		@old_on message_type, (message) =>
			fiber ->
				try
					action(message)
				catch error
					socket.emit('error', { error: parse_error(error), debug: error.stack })
					
exports.http_server = (actions) ->
	require('http').createServer (input, output) ->
		output.send = (what) ->
			@writeHead(200, { 'content-type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
			if typeof what == 'object'
				what = JSON.stringify(what)
			@end(what)
	
		fiber ->
			try
				path = decodeURI(require('url').parse(input.url, true).pathname)
				if actions[path]?
					actions[path](input, output)
				else
					console.error "URI not found: #{decodeURI(input.url)}"
					output.writeHead(404, { 'content-type': 'text/plain' })
					return output.end('URI not found')
					#return output.end('404')
			catch error
				output.send(error: parse_error(error), debug: error.stack)
