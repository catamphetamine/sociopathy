var Interactive_messages = function(options)
{
	var away_users = {}
	
	var messages = new Messages
	({
		data_source: options.data_source,
		prepend_message: function(data, prepend)
		{
			data.show_online_status = true
			var message = $.tmpl('сообщение в болталке', data)
			message.find('.popup_menu_container').prependTo(message)
			
			var author = message.find('.author')
			if (this.is_online(author.attr('author')))
				author.addClass('online')
			
			message.find('.text').find('a').attr('target', '_blank')
			
			if (away_users[data.отправитель._id])
				message.find('.author').addClass('is_away')
				
			prepend(message)

			// после preprend, т.к. стили				
			if (data.отправитель._id !== пользователь._id)
				this.initialize_call_action(message, message.attr('author'), 'of_message_author', function() { return message.find('.author').hasClass('online') })
		},
		more_link: options.more_link,
		container: options.container,
		scroller: прокрутчик,
		set_up_visual_editor: function(visual_editor)
		{
			var messages = this
			
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
				
				messages.connection.emit('пишет')
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
			this.connection.emit('сообщение', message)
		},
		after_append: function(message, data)
		{
			var is_another_users_message = data.отправитель._id !== пользователь._id
	
			// после append'а, т.к. стили
			if (is_another_users_message)
				this.initialize_call_action(message, message.attr('author'), 'of_message_author', function()
				{
					return message.find('.author').hasClass('online')
				})
		},
		show_editor: options.show_editor,
		on_load: options.on_load,
		on_first_time_data: options.on_first_time_data
	})
	
	messages.options.connection = options.connection
	
	messages.initialize_call_action = function(user_icon, user_id, style_class, condition)
	{
		var messages = this
		
		var actions = user_icon.find('.popup_menu_container')
		
		actions.find('.call').click(function(event)
		{
			event.preventDefault()
			messages.connection.emit('вызов', user_id)
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
	
	messages.кто_подцеплен = {}
	//messages.кто_подцеплен[пользователь._id] = true
	
	messages.подцепился = function(пользователь)
	{
		this.кто_подцеплен[пользователь._id] = true
		
		this.options.container.find('> li[author="' + пользователь._id + '"]').each(function()
		{
			$(this).find('> .author').addClass('online')
		})
		
		if (this.options.connection.on_user_connected)
			this.options.connection.on_user_connected(пользователь)
	}
	
	messages.отцепился = function(пользователь)
	{
		if (this.options.connection.on_user_disconnected)
			this.options.connection.on_user_disconnected(пользователь)
	}
	
	messages.is_online = function(id)
	{
		if (this.кто_подцеплен[id])
			return true
			
		return false
	}
	
	var is_away = false
	
	var old_on_load = messages.on_load
	messages.on_load = function()
	{
		messages.connect(function()
		{
			$(window).on_page('focus.messages', function()
			{
				is_away = false
				messages.dismiss_new_messages_notifications()
				messages.connection.emit('смотрит')
			})
			
			$(window).on_page('blur.messages', function()
			{
				is_away = true
				messages.connection.emit('не смотрит')
			})
			
			old_on_load()
		})
	}

	function new_message_channel(options)
	{
		var alarm_sound = new Audio("/звуки/alarm.ogg")
	
		var connected = false
		
		// handle reconnect
		var first_connection = true
		
		var status_classes =
		{
			'смотрит': 'is_idle',
			'не смотрит': 'is_away',
			'пишет': 'is_typing',
		}
		
		var status_expires_timer
		
		var the_options = options
		
		if (!options.away_aware_elements)
			options.away_aware_elements = ['.chat > li[author="${id}"] .author']
		
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
			
			var away_aware_elements = []
			
			the_options.away_aware_elements.for_each(function()
			{
				away_aware_elements.push($(this.replace_all('{id}', id)))
			})
			
			Object.each(status_classes, function(style_class, a_status)
			{
				if (a_status !== status)
				{
					away_aware_elements.for_each(function()
					{
						this.removeClass(style_class)
					})
				}
				else
				{
					away_aware_elements.for_each(function()
					{
						this.addClass(style_class)
					})
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
		
		messages.connect = function(callback)
		{
			var messages = this
			
			var connection = io.connect('http://' + Options.Websocket_server + options.path, { transports: ['websocket'], 'force new connection': true })
			
			connection.on('connect', function()
			{
				connected = true
				connection.emit('пользователь', $.cookie('user'))
			})
			
			var страница = page
			connection.on('готов', function()
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
					if (options.on_reconnection)
						options.on_reconnection()
				}
				
				if (options.on_connection)
					options.on_connection()
			})
			
			connection.on('кто здесь', function(data)
			{
				data.forEach(function(пользователь)
				{
					messages.подцепился(пользователь)
				})
			})
			
			connection.on('подцепился', function(пользователь)
			{
				messages.подцепился(пользователь)
			})
			
			connection.on('отцепился', function(пользователь)
			{
				messages.отцепился(пользователь)
			})
			
			connection.on('сообщение', function(данные)
			{
				if (is_away)
					messages.new_messages_notification()
			
				parse_date(данные, 'когда')
				messages.add_message(данные)
			})
			
			connection.on('смотрит', function(пользователь)
			{
				delete away_users[пользователь._id]
				set_status(пользователь._id, 'смотрит')
			})
			
			connection.on('не смотрит', function(пользователь)
			{
				away_users[пользователь._id] = true
				set_status(пользователь._id, 'не смотрит')
			})
			
			connection.on('вызов', function(пользователь)
			{
				alarm_sound.play()
				info('Вас вызывает ' + пользователь.имя)
			})
			
			connection.on('пишет', function(пользователь)
			{
				set_status(пользователь._id, 'пишет', { изтекает: 1000 })
			})
			
			connection.on('ошибка', function(ошибка)
			{
				if (ошибка.ошибка === true)
					return error('Ошибка связи с сервером')
		
				error(ошибка)
			})
			
			messages.connection = connection
		}
	}
	
	new_message_channel(options.connection)

	messages.on_load_actions.push(function()
	{
		messages.подцепился(пользователь)
	})
	
	return messages
}