var redis = require('redis')

var default_options =
{
	host: '127.0.0.1',
	port: '6379',
//	time_to_live: 60 * 60 /* an hour (in seconds) */
}

//var EventEmitter = require('events').EventEmitter

var Store = function Store(options) {}
//Store.prototype.__proto__ = EventEmitter.prototype;

module.exports = function(connect)
{
	function RedisStore(options)
	{
		this.options = снасти.merge(default_options, options)
		options = this.options
		
		//Store.call(this, options)
		
		this.prefix = options.prefix || 'connect_session:'
		
		this.client = options.client || new redis.createClient(options.port || options.socket, options.host, options)
		
		if (options.password)
		{
			this.client.auth(options.password, function(error)
			{
				if (error)
					throw error
			})
		}
		
		if (options.db)
		{
			var self = this
			self.client.select(options.db)
			self.client.on("connect", function()
			{
				self.client.send_anyways = true
				self.client.select(options.db)
				self.client.send_anyways = false
			})
		}
	}

	/**
	 * Inherit from `Store`.
	 */
	RedisStore.prototype.__proto__ = Store.prototype

	RedisStore.prototype.get = function(id, callback)
	{
		callback = callback || Function.new
	
		var store = this
		this.client.get(this.prefix + id, function(error, data)
		{
			try
			{
				if (!data)
					return callback()
				callback(null, JSON.parse(data.toString()))
			}
			catch (error)
			{
				callback(error)
			} 
		})
	}
	
	RedisStore.prototype.set = function(id, session_data, callback)
	{
		callback = callback || Function.new
		
		try
		{
			var multi = this.client.multi()
		
			multi.get(this.prefix + id, function(data)
			{
				if (data)
					session_data = Object.merge_recursive(session_data, JSON.parse(data.toString()))
			})
				
			if (this.options.time_to_live)
				multi.setex(this.prefix + id, this.options.time_to_live, JSON.stringify(session_data))
			else
				multi.set(this.prefix + id, JSON.stringify(session_data))
				
			multi.exec(function()
			{
				callback.apply(this, arguments)
			})
		}
		catch (error)
		{
			callback(error)
		} 
	}
	
	RedisStore.prototype.destroy = function(id, callback)
	{
		this.client.del(this.prefix + id, callback)
	}
	
	return RedisStore
}