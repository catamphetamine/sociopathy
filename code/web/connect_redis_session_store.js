var redis = require('redis')

var hour = 60 * 60

//var EventEmitter = require('events').EventEmitter

var Store = function Store(options) {}
//Store.prototype.__proto__ = EventEmitter.prototype;

module.exports = function(connect)
{
	function RedisStore(options)
	{
		options = options || {}
		
		if (!options.time_to_live)
			options.time_to_live = hour
		
		//Store.call(this, options)
		
		this.prefix = options.prefix || 'website_session:'
		
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
	
	RedisStore.prototype.set = function(id, session, callback)
	{
		callback = callback || Function.new
		
		try
		{
			this.client.setex(this.prefix + sid, options.time_to_live, JSON.stringify(session), function()
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