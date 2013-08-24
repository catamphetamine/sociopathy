var Эфир

var В_эфире = []
			
$(document).on('panel_loaded', function()
{
	if (!first_time_page_loading)
		return
	
	if (!пользователь)
		return

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
			},
			
			работает: function()
			{
				return эфир.is_ready
			},
			
			общения: [],
			
			общение: function(type, _id, environment)
			{
				var общение =
				{
					id:
					{
						type: type,
						_id: _id
					},
					
					environment: environment,
					
					connect: function()
					{
						if (!эфир.is_ready)
							return warning(text('websocket.error.connection lost'))
						
						эфир.emit('общение:connect', { id: общение.id, environment: environment })
					},
					
					disconnect: function()
					{
						эфир.emit('общение:disconnect', общение.id)
						
						Эфир.общения.remove(общение)
					},
					
					emit: function(what, data)
					{
						эфир.emit('общение:emit', { id: общение.id, message: what, data: data })
					},
					
					on: function(what, action)
					{
						if (what === 'disconnect')
							return общение.disconnected = action
						
						if (!общение.listeners)
							общение.listeners = {}
						
						общение.listeners[what] = action
					}
				}
				
				Эфир.общения.add(общение)
				
				return общение
			},
			
			общение_по_id: function(id)
			{
				function matches(общение)
				{
					var another_id = общение.id
					
					if (id.type !== another_id.type)
						return false
					
					if (!id._id && another_id._id)
						throw 'Incorrect communication id'
					
					if (!id._id)
						return true
					
					return id._id === another_id._id
				}
				
				var общения = Эфир.общения.filter(function(общение) { return matches(общение) })
				
				if (общения.is_empty())
					return
				
				if (общения.length > 1)
					throw 'Illegal state'
				
				return общения[0]
			}
		}
			
		Эфир.следить_за_пользователем(пользователь)
		
		эфир = io.connect('http://' + Configuration.Host + ':' + Configuration.Port + '/эфир',
		{
			'force new connection': true,
			'connection timeout': 3000,
			'reconnection limit': 3000,
			'max reconnection attempts': Infinity
		})
		
		эфир.is_ready = false
		
		Эфир.канал = эфир
			
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
				info('Сайт обновился. Обновите страницу', { sticky: true })
		})
		
		эфир.on('disconnect', function()
		{
			connected = false
			disconnected = true
			
			эфир.is_ready = false
			
			Эфир.общения.for_each(function()
			{
				if (this.disconnected)
					this.disconnected()
			})
			
			$('#panel .loading').addClass('shown')
		})
		
		эфир.on('готов', function()
		{
			эфир.is_ready = true
			
			$('#panel .loading').removeClass('shown')
			
			if (reconnected)
			{
				Эфир.общения.for_each(function()
				{
					this.reconnected = true
					this.connect()
				})
			}
			
			эфир.emit('уведомления')
			
			if (!reconnected)
				start_activity_monitor()
			
			if (first_time_page_loading)
				$(document).trigger('ether_is_online')
		})
		
		эфир.on('error', function(ошибка)
		{
			var debug = ошибка.debug
			ошибка = ошибка.error
			
			var options = { sticky: true }
	
			report_error('эфир', debug || ошибка)
	
			if (!ошибка)
				return
			
			if (ошибка === true)
				return error('Ошибка связи с сервером', options)
		
			if (ошибка === 'Слишком много сообщений пропущено')
				return error('Не удалось догрузить сообщения. Обновите страницу', { sticky: true })
			
			error(ошибка, options)
		})
		
		on('общение', 'emit', function(data)
		{
			общение = Эфир.общение_по_id(data.id)
			
			if (!общение)
			{
				console.log('Общение не найдено:')
				console.log(data.id)
				return
			}
			
			var listener = общение.listeners[data.message]
			
			if (!listener)
			{
				console.log('Слушатель не найден:')
				console.log(data.message)
				return
			}
			
			listener(data.data)
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
