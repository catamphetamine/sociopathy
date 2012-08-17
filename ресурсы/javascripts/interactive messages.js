var Interactive_messages = function(options)
{
	var away_users = {}
	
	var messages = new Messages
	({
		data_source: options.data_source,
		prepend_message: function(data, prepend)
		{
			var message = this.options.construct_message(data)
			message.find('.popup_menu_container').prependTo(message)
			
			var author = message.find('.author')
			if (this.is_connected(author.attr('author')))
				author.addClass('connected')
			
			message.find('.text').find('a').attr('target', '_blank')
			
			if (away_users[data.отправитель._id])
				message.find('.author').addClass('is_away')
				
			if (options.before_prepend)	
				options.before_prepend(message)
				
			prepend(message)

			// после preprend, т.к. стили				
			if (data.отправитель._id !== пользователь._id)
				this.initialize_user_actions(message, message.attr('author'), 'of_message_author', function()
				{
					return message.find('.author').hasClass('online')
				})
			
			return message
		},
		more_link: options.more_link,
		container: options.container,
		on_message_read: options.on_message_read,
		on_message_bottom_appears: options.on_message_bottom_appears,
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
			var message = this.create_message_element(data)
		
			if (away_users[data.отправитель._id])
				message.find('.author').addClass('is_away')
				
			return message
		},
		send_message: function(message)
		{
			if (!this.connection || !this.connection.is_ready)
				return false
		
			this.connection.emit('сообщение', message)
		},
		after_append: function(message, data)
		{
			if (Эфир.кто_в_сети.has(message.attr('author')))
				message.find('> .author').addClass('online')
		
			var is_another_users_message = data.отправитель._id !== пользователь._id
	
			// после append'а, т.к. стили
			if (is_another_users_message)
				this.initialize_user_actions(message, message.attr('author'), 'of_message_author', function()
				{
					return message.find('.author').hasClass('online')
				})
		},
		show_editor: options.show_editor,
		on_load: options.on_load,
		on_first_time_data: options.on_first_time_data,
		on_message_data: options.on_message_data
	})
	
	messages.options.connection = options.connection
	
	messages.initialize_user_actions = function(user_icon, user_id, style_class, condition)
	{
		var messages = this
		
		var actions = user_icon.find('.popup_menu_container')
		
		var menu_element = actions.find('> .popup_menu')
		
		if (menu_element.children().length === 0)
			return
		
		menu_element.find('> .call').click(function(event)
		{
			event.preventDefault()
			
			if (!this.connection || !this.connection.is_ready)
				return error('Потеряна связь с сервером')
		
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
			$(this).find('> .author').addClass('connected')
		})
		
		messages.внести_пользователя_в_список_вверху(пользователь)
				
		if (this.options.connection.on_user_connected)
			this.options.connection.on_user_connected(пользователь)
	}
	
	messages.отцепился = function(пользователь)
	{
		messages.убрать_пользователя_из_списка_вверху(пользователь)
				
		if (this.options.connection.on_user_disconnected)
			this.options.connection.on_user_disconnected(пользователь)
	}
	
	messages.is_connected = function(id)
	{
		if (this.кто_подцеплен[id])
			return true
			
		return false
	}
	
	var is_away = false

	function get_last_message_id()
	{
		var last_message = messages.options.container.find('> li:last')
		
		if (!last_message.exists())
			return
			
		return last_message.attr('message_id')
	}
	
	var updated_latest_message_read
	
	messages.update_latest_read_message = function()
	{
		if (updated_latest_message_read)
			if (updated_latest_message_read == this.latest_message_read)
				return
				
		if (!this.latest_message_read)
			return
			
		if (this.последнее_прочитанное_сообщение)
			if (this.latest_message_read <= this.последнее_прочитанное_сообщение)
				return
	
		if (!this.connection || !this.connection.is_ready)
			return // (function() { messages.read(_id) }).delay(200) // no simple "delay" with ajax navigation, use page.delay
		
		this.connection.emit('прочитано', this.latest_message_read)
		updated_latest_message_read = this.latest_message_read
	}
	.bind(messages)
	
	var old_on_load = messages.on_load
	messages.on_load = function()
	{
		var пользователь_в_сети = page.пользователь_в_сети
		page.пользователь_в_сети = function(пользователь)
		{
			пользователь_в_сети(пользователь)
			
			messages.options.container.find('> li[author="' + пользователь._id + '"]').each(function()
			{
				$(this).find('> .author').addClass('online')
			})
		}
		
		var пользователь_вышел = page.пользователь_вышел
		page.пользователь_вышел = function(пользователь)
		{
			пользователь_вышел(пользователь)
			
			messages.options.container.find('> li[author="' + пользователь._id + '"]').each(function()
			{
				$(this).find('> .author').removeClass('online')
			})
		}
		
		messages.who_is_connected_bar_list = page.get('.who_is_connected')
		messages.who_is_connected_bar_list.parent().floating_top_bar()
		
		messages.unload = function()
		{
			messages.who_is_connected_bar_list.parent().floating_top_bar('unload')
			
			if (messages.connection)
			{
				messages.connection.emit('выход')
				//alert(messages.connection.websocket.disconnectSync)
				//messages.connection.websocket.disconnectSync()
			}
		}
		
		messages.connect(function()
		{
			$(window).on_page('focus.messages', function()
			{
				is_away = false
				//messages.dismiss_new_messages_notifications()
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
		var connected = false
		var disconnected = false
		var reconnected = false
		
		// handle reconnect
		//var first_connection = true
		
		var status_classes =
		{
			'смотрит': 'is_idle',
			'не смотрит': 'is_away',
			'пишет': 'is_typing',
		}
		
		var status_expires_timer
		
		var the_options = options
		
		if (!options.away_aware_elements)
			options.away_aware_elements = []
			
		options.away_aware_elements.push('.who_is_connected > li[user="{id}"]')
		
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
			
			var накопленные_сообщения = []
			var пропущенные_сообщения_учтены = false
			
			var connection = io.connect('http://' + Options.Websocket_server + options.path, { transports: ['websocket'], 'force new connection': true })
			connection.is_ready = false
			
			connection.on('connect', function()
			{
				connected = true
				
				if (disconnected)
				{
					disconnected = false
					reconnected = true
				}
				
				connection.emit('пользователь', $.cookie('user'))
			})
			
			connection.on('пользователь подтверждён', function()
			{
				connection.emit('environment', messages.options.environment)
			})
			
			connection.on('disconnect', function()
			{
				connected = false
				disconnected = true
				
				connection.is_ready = false
				
				накопленные_сообщения = []
				пропущенные_сообщения_учтены = false
			})
			
			connection.on('пропущенные сообщения', function(сообщения)
			{
				var after = сообщения.shift()._id
				сообщения.for_each(function()
				{
					this.after = after
					after = this._id
					parse_date(this, 'когда')
					messages.add_message(this)
				})
				
				накопленные_сообщения.for_each(function()
				{
					messages.add_message(this)
				})
				
				if (сообщения.length > 1 || накопленные_сообщения.length > 0)
					if (is_away)
						messages.new_messages_notification()
				
				пропущенные_сообщения_учтены = true
			})
			
			var страница = page
			connection.on('готов', function()
			{
				if (страница.void)
					return
					
				connection.is_ready = true
					
				if (!reconnected)
				{
					callback()
					
					page.ticking(messages.update_latest_read_message, 2000)
					
					messages.внести_пользователя_в_список_вверху(пользователь, { куда: 'в начало' })

					if (options.on_connection)
						options.on_connection.bind(messages)()
				}
				else
				{
					messages.who_is_connected_bar_list.empty()
					
					if (options.on_reconnection)
						options.on_reconnection.bind(messages)()
				}
				
				messages.подцепился(пользователь)
				
				connection.emit('получить пропущенные сообщения', { _id: messages.options.container.find('> li:last').attr('message_id') })
				connection.emit('кто здесь?')
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
			
			connection.on('сообщение', function(сообщение)
			{
				parse_date(сообщение, 'когда')

				//console.log(сообщение)
				
				if (сообщение.отправитель._id != пользователь._id)
					сообщение.новое = true
				
				if (!пропущенные_сообщения_учтены)
				{
					накопленные_сообщения.push(сообщение)
					return
				}
					
				if (is_away)
					messages.new_messages_notification()
			
				messages.add_message(сообщение)
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

	messages.внести_пользователя_в_список_вверху = function(user, options)
	{
		if (messages.who_is_connected_bar_list.find('> li[user="' + user._id + '"]').exists())
			return
	
		var container = $('<li user="' + user._id + '"></li>')
		container.addClass('online')
		
		$.tmpl('chat user icon', { отправитель: user }).appendTo(container)
		
		if (options)
			if (options.куда === 'в начало')
				return container.prependTo(messages.who_is_connected_bar_list)
		
		container.css('opacity', '0')
		container.appendTo(messages.who_is_connected_bar_list)
		ajaxify_internal_links(content)
		
		// после append'а, т.к. стили
		if (user._id !== пользователь._id)
			messages.initialize_user_actions(container, user._id, 'of_online_user')
			
		animator.fade_in(container, { duration: 1 }) // in seconds
	}
	
	messages.убрать_пользователя_из_списка_вверху = function(пользователь)
	{
		var icon = messages.who_is_connected_bar_list.find('[user="' + пользователь._id + '"]')
		icon.fadeOut(500, function()
		{
			icon.remove()
		})
	}
		
	new_message_channel(options.connection)

	return messages
}