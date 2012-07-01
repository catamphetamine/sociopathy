var Эфир

$(document).on('authenticated', function()
{
	if (пользователь)
	{	
		(function()
		{
			var эфир
			
			var за_кем_следить = new Map()
			
			$(document).on('page_unloaded', function()
			{
				за_кем_следить = new Map()
			})
			
			Эфир =
			{
				кто_в_сети: new Map(),
				
				следить_за_пользователем: function(пользователь)
				{
					за_кем_следить.set(пользователь._id.toString(), true)
				},
				
				следить_за_пользователями: function(пользователи)
				{
					пользователи.for_each(function()
					{
						Эфир.следить_за_пользователем(this)
					})
				}
			}
			
			Эфир.следить_за_пользователем(пользователь)
			
			эфир = io.connect('http://' + Options.Websocket_server + '/эфир', { transports: ['websocket'] })
			
			эфир.on('connect', function()
			{
				эфир.emit('пользователь', $.cookie('user'))
			})
			
			эфир.on('who is online', function(пользователи)
			{
				пользователи.for_each(function()
				{
					Эфир.кто_в_сети.set(this._id.toString(), this)
					
					//if (за_кем_следить.has(this._id))
					page.пользователь_в_сети(this)
				})
			})
			
			эфир.on('online', function(пользователь)
			{
				//info(пользователь._id + ' online')
				Эфир.кто_в_сети.set(пользователь._id.toString(), пользователь)
					
				if (за_кем_следить.has(пользователь._id.toString()))
					page.пользователь_в_сети(пользователь)
			})
			
			эфир.on('offline', function(пользователь)
			{
				//info(пользователь._id + ' offline')
				delete Эфир.кто_в_сети[пользователь._id.toString()]
					
				if (за_кем_следить.has(пользователь._id.toString()))
					page.пользователь_вышел(пользователь)
			})
		})()
	}
})