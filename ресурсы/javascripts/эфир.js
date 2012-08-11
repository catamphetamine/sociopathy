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
			
			var on = function(group, name, handler)
			{
				эфир.on(group + ':' + name, handler)
			}
			
			эфир.on('connect', function()
			{
				эфир.emit('пользователь', $.cookie('user'))
			})
			
			on('пользователи', 'кто здесь', function(пользователи)
			{
				пользователи.for_each(function()
				{
					Эфир.кто_в_сети.set(this._id.toString(), this)
					
					//if (за_кем_следить.has(this._id))
					page.пользователь_в_сети(this)
				})
			})
			
			on('пользователи', 'online', function(пользователь)
			{
				//info(пользователь._id + ' online')
				Эфир.кто_в_сети.set(пользователь._id.toString(), пользователь)
					
				if (за_кем_следить.has(пользователь._id.toString()))
					page.пользователь_в_сети(пользователь)
			})
			
			on('пользователи', 'offline', function(пользователь)
			{
				//info(пользователь._id + ' offline')
				delete Эфир.кто_в_сети[пользователь._id.toString()]
					
				if (за_кем_следить.has(пользователь._id.toString()))
					page.пользователь_вышел(пользователь)
			})
			
			var звук_вызова = new Audio("/звуки/вызов.ogg")
	
			on('общее', 'вызов', function(пользователь)
			{
				звук_вызова.play()
				info('Вас вызывает ' + пользователь.имя)
			})
			
			on('новости', 'звуковое оповещение', function(data)
			{
				//alert('звуковое оповещение')
				Новости.звуковое_оповещение(data.чего)
			})
			
			on('новости', 'болталка', function(data)
			{
				Новости.болталка(data._id)
			})
			
			on('новости', 'беседы', function(data)
			{
				Новости.беседа(data._id, data.сообщение)
			})
			
			on('новости', 'обсуждения', function(data)
			{
				Новости.обсуждение(data._id, data.сообщение)
			})
			
			on('новости', 'новости', function(data)
			{
				Новости.новости(data._id)
			})
		})()
	}
})