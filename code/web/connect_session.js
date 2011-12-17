var connect_utilities = require('connect').utils

var Session = function(id, request, data)
{
	this._id = id
	this._request = request
	
	if ('object' == typeof data)
		connect_utilities.merge(this, data)
}

Session.prototype.save = function(callback)
{
	this._request.sessionStore.set(this._id, this, callback || function(){})
	return this
}

Session.prototype.destroy = function(callback)
{
	delete this._request.session
	this._request.sessionStore.destroy(this._id, callback)
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
		
		store.get(id, function(error, session)
		{
			if (error)
				if (error.code !== 'ENOENT')
					return next(error)

			request.session = new Session(id, request, session)
			next()
		})
	}
}