var Эфир

$(document).on('panel_loaded', function()
{
	if (!first_time_page_loading)
		return
	
	if (!пользователь)
		return

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
		
		эфир = io.connect('http://' + Configuration.Websocket_server + '/эфир', { transports: ['websocket'] })
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
			var options = { sticky: true }
			
			report_error('эфир', ошибка)
			
			if (ошибка === true)
				return error('Ошибка связи с сервером', options)
	
			error(ошибка, options)
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
		
		on('сообщения', 'правка', function(data)
		{
			switch (data.чего)
			{
				case 'обсуждение':
					var discussion = $('#discussion[_id="' + data.чего_id + '"]')
					if (discussion.exists())
					{
						var message = discussion.find('> [message_id="' + data._id + '"]')
						if (message.exists())
						{	
							if (!message.hasClass('new'))
							{
								message.addClass('new');
								(function() { message.removeClass('new') }).delay(500)
							}
							
							message.find('.content').html(Wiki_processor.decorate(data.сообщение))
							
							postprocess_rich_content(message)
						}
					}
					break
				
				case 'беседа':
					var talk = $('#talk[_id="' + data.чего_id + '"]')
					if (talk.exists())
					{
						var message = talk.find('> [message_id="' + data._id + '"]')
						if (message.exists())
						{
							if (!message.hasClass('new'))
							{
								message.addClass('new');
								(function() { message.removeClass('new') }).delay(500)
							}
							
							message.find('.content').html(Wiki_processor.decorate(data.сообщение))
							
							postprocess_rich_content(message)
						}
					}
					break
				
				case 'болталка':
					var message = $('#chat > [message_id="' + data._id + '"]')
					if (message.exists())
					{
						if (!message.hasClass('new'))
						{
							message.addClass('new');
							(function() { message.removeClass('new') }).delay(500)
						}
						
						message.find('.content').html(Wiki_processor.decorate(data.сообщение))
						
						postprocess_rich_content(message)
					}
					break
				
				default:
					return
			}
		})
		
		on('новости', 'прочитано', function(data)
		{
			function transform()
			{
				switch (data.что)
				{
					case 'новости':
						return { новость: data._id }
					
					case 'болталка':
						return { болталка: data._id }
					
					case 'беседа':
						return { беседа: data.сообщения_чего, сообщение: data._id }
					
					case 'обсуждение':
						return { обсуждение: data.сообщения_чего, сообщение: data._id }
				}
			}
			
			Новости.прочитано(transform(data))
		})
		
		on('новости', 'звуковое оповещение', function(data)
		{
			//alert('звуковое оповещение')
			Новости.звуковое_оповещение(data.чего)
		})
		
		on('новости', 'болталка', function(data)
		{
			Новости.болталка(data.сообщение)
		})
		
		on('новости', 'беседа', function(data)
		{
			Новости.беседа(data._id, data.сообщение, { id: data.id, отправитель: data.отправитель, text: data.text })
		})
		
		on('новости', 'беседа.добавление', function(data)
		{
			info('Вас добавили в беседу <a href=\'/сеть/беседы/' + data.id + '\'>«' + data.название + '»</a>')
		})
		
		on('новости', 'обсуждение', function(data)
		{
			Новости.обсуждение(data._id, data.сообщение, { id: data.id, отправитель: data.отправитель, text: data.text })
		})
		
		on('новости', 'новости', function(data)
		{
			Новости.новости(data._id)
		})
		
		on('новости', 'уведомления', function(data)
		{
			Новости.сброс()
			
			if (data.новости && !data.новости.пусто())
			{
				Новости.новости(data.новости)
			}
			
			if (data.беседы)
			{
				Object.for_each(data.беседы, function(_id)
				{
				   Новости.беседа(_id, this)
				})
			}
			
			if (data.обсуждения)
			{
				Object.for_each(data.обсуждения, function(_id)
				{
				   Новости.обсуждение(_id, this)
				})
			}
			
			if (data.болталка)
			{
				Новости.болталка(data.болталка)
			}
			
			panel.loading.hide()
		})
		
		on('пользователь', 'смена имени', function(name)
		{
			$('.authenticated_user > .info > .name').text(name)
		})
		
		on('пользователь', 'настройки.клавиши', function(data)
		{
			Object.x_over_y(data.клавиши, Настройки.Клавиши)
		})
		
		on('беседа', 'переназвано', function(data)
		{
			$(document).trigger('talk_renamed', data)
		})
		
		on('обсуждение', 'переназвано', function(data)
		{
			$(document).trigger('discussion_renamed', data)
		})
		
		/*
		on('беседы', 'сообщение', function(data)
		{
			if (Страница.is('сеть/беседы'))
			{
				var talk = $('#talks').find('>[_id="' + data.где + '"]')
				if (!talk.exists())
					return
				
				talk.find('> a > .when').attr('date', new Date().getTime()).text(неточное_время(new Date()))
				talk.find('> a > .small_avatar').replaceWith($.tmpl('маленький аватар', data.кем))
				talk.prependTo($('#talks'))
			}
		})
		
		on('обсуждения', 'сообщение', function(data)
		{
			if (Страница.is('сеть/обсуждения'))
			{
				var discussion = $('#discussions').find('>[_id="' + data.где + '"]')
				if (!discussion.exists())
					return
				
				discussion.find('> a > .when').attr('date', new Date().getTime()).text(неточное_время(new Date()))
				discussion.find('> a > .small_avatar').replaceWith($.tmpl('маленький аватар', data.кем))
				discussion.prependTo($('#discussions'))
			}
		})
		*/
		
		on('пользователь', 'аватар обновлён', function(data)
		{
			var avatar = $('.authenticated_user .small_avatar .picture img')
			avatar.attr('src', set_version(avatar.attr('src'), data.version))
		})
		
		on('пользователь', 'не_показывать_подсказку', function(data)
		{
			пользователь.session.не_показывать_подсказки.push(data.подсказка)
		})
	})()
})