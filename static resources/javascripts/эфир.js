var Эфир

var В_эфире = []

$(document).on('panel_loaded', function()
{
	if (!first_time_page_loading)
		return
	
	if (!пользователь)
		return

	panel.loading.show()

	;(function()
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
		
		эфир = io.connect('http://' + Configuration.Host + '/websocket' + '/эфир', { transports: ['websocket'] })
		эфир.is_ready = false
		
		var on = function(group, name, handler)
		{
			эфир.on(group + ':' + name, handler)
		}
		
		Эфир.on = on
		
		var connected = false
		var disconnected = false
		var reconnected = false
			
		эфир.on('connect', function()
		{
			connected = true
			
			if (disconnected)
			{
				disconnected = false
				reconnected = true
			}
		})
		
		эфир.on('поехали', function()
		{
			эфир.emit('пользователь', $.cookie('user'))
		})
		
		эфир.on('version', function(data)
		{
			if (Version != data)
				warning('Сайт обновился. Обновите страницу', { sticky: true })
		})
		
		эфир.on('disconnect', function()
		{
			connected = false
			disconnected = true
			
			эфир.is_ready = false
			
			panel.loading.show()
		})
		
		эфир.on('готов', function()
		{
			эфир.is_ready = true
				
			if (!reconnected)
			{
				эфир.emit('уведомления')
			}
			else
			{
				эфир.emit('уведомления')
			}
			
			if (first_time_page_loading)
				$(document).trigger('ether_is_online')
		})
		
		эфир.on('error', function(ошибка)
		{
			var debug = ошибка.debug
			ошибка = ошибка.error
			
			var options = { sticky: true }
	
			report_error('эфир', debug || ошибка)
			
			if (ошибка === true)
				return error('Ошибка связи с сервером', options)
	
			if (!ошибка)
				return
			
			error(ошибка, options)
		})
		
		on('пользователи', 'кто здесь', function(пользователи)
		{
			пользователи.for_each(function()
			{
				Эфир.кто_в_сети.set(this._id.toString(), this)
				
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
		
		В_эфире.for_each(function()
		{
			on(this.id, this.type, this.action)
		})
		
		on('новости', 'звуковое оповещение', function(data)
		{
			//alert('звуковое оповещение')
			Новости.звуковое_оповещение(data.чего)
		})
		
		on('новости', 'уведомления', function(data)
		{
			Новости.сброс()
			
			Object.for_each(Новости.news, function()
			{
				this.notifications(data)
			})
			
			panel.loading.hide()
		})
		
		on('пользователь', 'смена имени', function(имя)
		{
			$('.authenticated_user > .info > .name').text(имя)
			
			пользователь.имя = имя
		})
		
		on('пользователь', 'настройки.клавиши', function(data)
		{
			Object.x_over_y(data.клавиши, Настройки.Клавиши)
		})
		
		on('пользователь', 'аватар обновлён', function(data)
		{
			var avatar = $('.authenticated_user .real_picture')
			avatar.attr('src', set_version(link_to('user.avatar.small', data.пользователь), data.version))
			
			пользователь.avatar_version = data.version
		})
		
		on('пользователь', 'не_показывать_подсказку', function(data)
		{
			пользователь.session.не_показывать_подсказки.push(data.подсказка)
		})
	})()
})
