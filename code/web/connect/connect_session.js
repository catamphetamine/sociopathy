var connect_utilities = require('connect').utils

var Session = function(id, request, data)
{
	this.id = id
	this.request = request
	this.data = {}
	
	if (typeof data === 'object')
		connect_utilities.merge(this.data, data)
}

Session.prototype.save = function(callback)
{
	this.request.sessionStore.set(this.id, this.data, callback || function(){})
	return this
}

Session.prototype.destroy = function(callback)
{
	delete this.request.session
	this.request.sessionStore.destroy(this.id, callback)
	return this
}

module.exports = function(get_session_id, store)
{
	return function(request, response, next)
	{
		// self-awareness
		if (request.session)
			throw 'Session already exists'
	
		//return require('express').cookieParser(request, response, next)
		
		var id = get_session_id(request)
		if (!id)
			return next()
			
		// expose store
		request.sessionStore = store
		
		// proxy end() to commit the session
		var end = response.end
		response.end = function(data, encoding)
		{
			response.end = end
		
			if (request.session)
				request.session.save(function()
				{
					response.end(data, encoding)
				})
			else
				response.end(data, encoding)
		}
	
		//
		
		var pause = connect_utilities.pause(request)
		
		var _next = next;
		next = function(error)
		{
			_next(error)
			pause.resume()
		}
	
		//
		
		store.get(id, function(error, session_data)
		{
			if (error)
				if (error.code !== 'ENOENT')
					return next(error)

			//if (!session_data)
			//	return next()
				
			request.session = new Session(id, request, session_data)
			next()
		})
	}
}