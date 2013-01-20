var Shared_worker = new Class
({
	initialize: function(script, name, handlers)
	{
		/*
		this.script = script
		this.name = name
		this.handlers = handlers
		*/
		
		var worker = new SharedWorker(script, name)
			
		var channel = Shared_worker.channel(worker.port)
			
		worker.port.addEventListener('message', function(event) 
		{
			var type = event.data.type
			var message = event.data.message
			
			Object.for_each(handlers, function(message_type, handler)
			{
				if (type === message_type)
					handler.bind(channel)(message)
			})
		}, 
		false)
		
		worker.port.start()
		
		this.worker = worker
		
		this.send = channel.send
	},
	
	broadcast: function(type, message)
	{
		this.send('broadcast', { type: message })
	}
})

Shared_worker.new = function(worker, handlers, initializer)
{
	var peers = []
	
	worker.addEventListener('connect', function(event) 
	{
		var port = event.ports[0]
		
		peers.push(port)
		
		var channel = Shared_worker.channel(port)
		channel.id = peers.length
		
		var broadcast = function(data)
		{
			var type
			var message
			
			Object.for_each(data, function(key, value)
			{
				type = key
				message = value
			})
			
			peers.forEach(function(peer) 
			{
				if (peer !== port)
					Shared_worker.channel(peer).send(type, message)
			})
		}
		
		//if (initializer)
		//	initializer(channel)
		
		port.addEventListener('message', function(event) 
		{
			var type = event.data.type
			var message = event.data.message
			
			if (type === 'broadcast')
				return broadcast(message)
			
			Object.for_each(handlers, function(message_type, handler)
			{
				if (type === message_type)
					handler.bind(channel)(message)
			})
		})
		
		port.start()
	})
}

Shared_worker.channel = function(port)
{
	var channel =
	{
		send: function(type, message)
		{
			port.postMessage({ type: type, message: message })
		},
		
		reply: function(type, message)
		{
			this.send(type, message)
		}
	}
	
	return channel
}

/*
in worker.js:

function connect_to_worker(handlers)
{
	return new Shared_worker('shared worker.js', 'shared_worker_example', handlers)
}

on page:

var worker = connect_to_worker
({
	hello: function(message)
	{
		log('Worker replied: ' + message)
	},
	
	id: function(message)
	{
		log('My id is ' + message)
	},
	
	session: function(message)
	{
		log('We are in session ' + message)
	},
	
	joined: function(message)
	{
		log(message + ' joined the session')
	}
})

worker.send('hello', 'Hello worker')

shared worker.js:

var session = new Date()

Shared_worker.new(self,
{
	hello: function(message)
	{
		this.reply('hello', 'Hello page')
		this.reply('id', this.id)
		this.reply('session', session)
		this.broadcast('joined', 'Page #' + this.id)
	}
})
*/