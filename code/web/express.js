var express = require('express')

module.exports = function(приложение)
{
	приложение.configure(function()
	{
		приложение.use(express.bodyParser())
		приложение.use(express.methodOverride())
		приложение.use(express.cookieParser())
		приложение.use(приложение.router)
		приложение.use(express.session({ secret: "какой-то ключ" }))
	})

	приложение.configure('development', function(){
		приложение.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
	})

	приложение.configure('production', function(){
		приложение.use(express.errorHandler())
	})
	
	var api = 
	{
		http:
		{
			get: function(адрес, возврат)
			{
				приложение.get(encodeURI(адрес), возврат)
			},

			post: function(адрес, возврат)
			{
				приложение.post(encodeURI(адрес), возврат)
			},

			put: function(адрес, возврат)
			{
				приложение.put(encodeURI(адрес), возврат)
			},

			delete: function(адрес, возврат)
			{
				приложение.delete(encodeURI(адрес), возврат)
			}
		}
	}
	
	return api
}