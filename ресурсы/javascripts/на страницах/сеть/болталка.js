(function()
{
	title('Болталка')
	
	var who_is_online_bar_list
	
	var away_users = {}
	
	var кто_в_болталке = {}
	кто_в_болталке[пользователь._id] = true
	
	var is_away = false
	
	var alarm_sound = new Audio("/звуки/alarm.ogg")
	
	var messages
	
	var chat_loaded // on load function
	var chat
		
	page.load = function()
	{
		Подсказки.подсказка('Здесь вы можете разговаривать с другими членами сети.')
		Подсказки.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
		Подсказки.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')

		chat = $('#chat_container .chat')
		
		messages = new Messages
		({
			data_source: '/приложение/болталка/сообщения',
			prepend_message: function(data, prepend)
			{
				data.show_online_status = true
				var message = $.tmpl('сообщение в болталке', data)
				message.find('.popup_menu_container').prependTo(message)
				
				var author = message.find('.author')
				if (is_online(author.attr('author')))
					author.addClass('online')
				
				message.find('.text').find('a').attr('target', '_blank')
				
				if (away_users[data.отправитель._id])
					message.find('.author').addClass('is_away')
					
				prepend(message)

				// после preprend, т.к. стили				
				if (data.отправитель._id !== пользователь._id)
					initialize_call_action(message, message.attr('author'), 'of_message_author', function() { return message.find('.author').hasClass('online') })
			},
			more_link: $('#chat_container .older > a'),
			container: chat,
			scroller: прокрутчик,
			set_up_visual_editor: function(visual_editor)
			{
				var can_signal_typing = true
				// html5 input event seems to be unsupported
				visual_editor.editor.on('content_changed.editor', function(event)
				{
					if (!can_signal_typing)
						return
					
					can_signal_typing = false
					var unlocker = function()
					{
						can_signal_typing = true
					}
					unlocker.delay(500)
					
					//if (visual_editor.editor.is_empty())
					//	console.log ('стёр')
					
					болталка.emit('пишет')
				})
			},
			construct_message: function(data)
			{
				data.show_online_status = true
				var message = $.tmpl('сообщение в болталке', data)
			
				if (away_users[data.отправитель._id])
					message.find('.author').addClass('is_away')
					
				return message
			},
			send_message: function(message)
			{
				болталка.emit('сообщение', message)
			},
			after_append: function(message, data)
			{
				var is_another_users_message = data.отправитель._id !== пользователь._id
		
				// после append'а, т.к. стили
				if (is_another_users_message)
					initialize_call_action(message, message.attr('author'), 'of_message_author', function() { return message.find('.author').hasClass('online') })
			},
			on_load: chat_loaded
		})
	}
	
	page.unload = function()
	{
		$('.who_is_online_bar').floating_top_bar('unload')
		
		if (болталка)
		{
			болталка.emit('выход')
			//alert(болталка.websocket.disconnectSync)
			//болталка.websocket.disconnectSync()
		}
	}
	
	function initialize_call_action(user_icon, user_id, style_class, condition)
	{
		var actions = user_icon.find('.popup_menu_container')
		
		actions.find('.call').click(function(event)
		{
			event.preventDefault()
			болталка.emit('вызов', user_id)
		})
		
		activate_popup_menu
		({
			activator: user_icon.find('.picture'),
			actions: actions,
			condition: condition,
			style_class: style_class,
			fade_in_duration: 0.1,
			fade_out_duration: 0.1
		})
	}
		
	function пользователь_в_сети(пользователь)
	{
		кто_в_болталке[пользователь._id] = true
		
		chat.find('> li[author="' + пользователь._id + '"]').each(function()
		{
			$(this).find('.author').addClass('online')
		})
		
		внести_пользователя_в_список_вверху(пользователь)
	}
	
	function is_online(id)
	{
		if (кто_в_болталке[id])
			return true
			
		return false
	}
	
	function внести_пользователя_в_список_вверху(user, options)
	{
		if (who_is_online_bar_list.find('> li[user="' + user._id + '"]').exists())
			return
	
		var container = $('<li user="' + user._id + '"></li>')
		container.addClass('online')
		
		$.tmpl('chat user icon', { отправитель: user }).appendTo(container)
		
		if (options)
			if (options.куда === 'в начало')
				return container.prependTo(who_is_online_bar_list)
		
		container.css('opacity', '0')
		container.appendTo(who_is_online_bar_list)
		ajaxify_internal_links(content)
		
		// после append'а, т.к. стили
		if (user._id !== пользователь._id)
			initialize_call_action(container, user._id, 'of_online_user')
			
		animator.fade_in(container, { duration: 1 }) // in seconds
	}
	
	function пользователь_вышел_из_болталки(пользователь)
	{
		delete кто_в_болталке[пользователь._id]
	
		chat.find('> li[author="' + пользователь._id + '"]').each(function()
		{
			$(this).find('.author').removeClass('online')
		})
		
		var icon = who_is_online_bar_list.find('[user="' + пользователь._id + '"]')
		icon.fadeOut(500, function()
		{
			icon.remove()
		})
	}
	
	var status_classes =
	{
		'смотрит': 'is_idle',
		'не смотрит': 'is_away',
		'пишет': 'is_typing',
	}
	
	var status_expires_timer
	
	function set_status(id, status, options)
	{
		if (status_expires_timer)
		{
			clearTimeout(status_expires_timer)
			status_expires_timer = null
		}
		
		options = options || {}
	
		if (!status)
			status = 'смотрит'
	
		var online_bar_element = $('.who_is_online > li[user="' + id + '"]')
		var chat_message_author_element = $('.chat > li[author="' + id + '"] .author')
		
		Object.each(status_classes, function(style_class, a_status)
		{
			if (a_status !== status)
			{
				online_bar_element.removeClass(style_class)
				chat_message_author_element.removeClass(style_class)
			}
			else
			{
				online_bar_element.addClass(style_class)
				chat_message_author_element.addClass(style_class)		
			}
		})
		
		if (options.изтекает)
		{
			status_expires_timer = function()
			{
				set_status(id)
			}
			.delay(options.изтекает)
		}
	}
	
	var болталка
	var болталка_подключена = false
	// handle reconnect
	var first_connection = true
	
	function connect_to_chat(callback)
	{
		болталка = io.connect('http://' + Options.Websocket_server + '/болталка', { transports: ['websocket'], 'force new connection': true })
		
		болталка.on('connect', function()
		{
			болталка_подключена = true
			болталка.emit('пользователь', $.cookie('user'))
		})
		
		var страница = page
		болталка.on('готов', function()
		{
			if (страница.void)
				return
				
			if (first_connection)
			{
				callback()
				first_connection = false
			}
			else
			{
				who_is_online_bar_list.empty()
			}
			
			внести_пользователя_в_список_вверху(пользователь, { куда: 'в начало' })
		})
		
		болталка.on('online', function(data)
		{
			data.forEach(function(пользователь)
			{
				пользователь_в_сети(пользователь)
			})
		})
		
		болталка.on('user_online', function(пользователь)
		{
			пользователь_в_сети(пользователь)
		})
		
		болталка.on('offline', function(пользователь)
		{
			пользователь_вышел_из_болталки(пользователь)
		})
		
		болталка.on('сообщение', function(данные)
		{
			if (is_away)
				messages.new_messages_notification()
		
			parse_date(данные, 'время')
			messages.add_message(данные)
		})
		
		болталка.on('смотрит', function(пользователь)
		{
			delete away_users[пользователь._id]
			set_status(пользователь._id, 'смотрит')
		})
		
		болталка.on('не смотрит', function(пользователь)
		{
			away_users[пользователь._id] = true
			set_status(пользователь._id, 'не смотрит')
		})
		
		болталка.on('вызов', function(пользователь)
		{
			alarm_sound.play()
			info('Вас вызывает ' + пользователь.имя)
		})
		
		болталка.on('пишет', function(пользователь)
		{
			set_status(пользователь._id, 'пишет', { изтекает: 1000 })
		})
		
		болталка.on('ошибка', function(ошибка)
		{
			if (ошибка.ошибка === true)
				return error('Ошибка связи с сервером')
	
			error(ошибка)
		})
	}

	chat_loaded = function(finish_initialization)
	{
		who_is_online_bar_list = $('.who_is_online')
		$('.who_is_online_bar').floating_top_bar()
		
		connect_to_chat(function()
		{
			$(window).on_page('focus.chat', function()
			{
				is_away = false
				messages.dismiss_new_messages_notifications()
				болталка.emit('смотрит')
			})
			
			$(window).on_page('blur.chat', function()
			{
				is_away = true
				болталка.emit('не смотрит')
			})
			
			finish_initialization()
		})
	}
})()