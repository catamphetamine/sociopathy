# requires 'node-sync' and 'node-fibers'
global.fiber = require 'sync'

fiber = global.fiber

Function.prototype.await = ->
	parameters = Array.prototype.slice.call(arguments)
	@bind_await(@).apply(@, parameters)
	
Function.prototype.bind_await = (binding) ->
	return =>
		parameters = Array.prototype.slice.call(arguments)
		# add binding as a first argument
		parameters.unshift(binding)
		@sync.apply(@, parameters)
	
exports.express_action = (action, url, input, output) ->
	action(input, output)

parse_error = (error) ->
	console.log '=========================== Error ============================'
	console.log error.stack
	console.log '=============================================================='
	
	if typeof error == 'object'
		if JSON.stringify(error) == '{}'
			error = error + ''
	
	error
		
exports.express = (application) ->
	global.http = {}
	
	['get', 'post', 'put', 'delete'].forEach (method) ->
		global.http[method] = (url, action) ->
			enhanced_action = (input, output) ->
				fiber ->
					try
						exports.express_action(action, url, input, output)
					catch error
						output.send(error: parse_error(error), debug: error.stack)
						
			application[method](encodeURI(url), enhanced_action)
			
exports.websocket = (socket) ->
	socket.old_on = socket.on
	
	socket.on = (message_type, action) ->
		@old_on message_type, (message) =>
			fiber ->
				try
					action(message)
				catch error
					socket.emit('error', { error: parse_error(error), debug: error.stack })