function add_message_channeling_capabilities(messages, interactive_messages_options)
{
	var options = messages.options.connection

	var status_classes =
	{
		'смотрит': 'is_idle',
		'не смотрит': 'is_away',
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
		var накопленные_сообщения = []
		var пропущенные_сообщения_учтены = false
		
		var pending_messages = []
		
		var что = interactive_messages_options.info.что
		
		var _id
		if (interactive_messages_options.info.общение)
			_id = interactive_messages_options.info.общение()
		
		this.is_supposed_to_be_connected = true
		
		var connection = Эфир.общение(что, _id, messages.options.environment)
		
		var получить_пропущенные_сообщения = function()
		{
			var latest_message = messages.options.container.find('> li:last').attr('message_id')
			if (!latest_message)
				return пропущенные_сообщения_учтены = true
			
			connection.emit('получить пропущенные сообщения', { _id: latest_message })		
		}
		
		function try_to_append_message(сообщение)
		{
			if (сообщение.предыдущее)
				if (!messages.has_message(сообщение.предыдущее))
					return
				
			if (сообщение.новое)
				messages.new_messages_notification()
		
			messages.add_message(сообщение)
			return true
		}
			
		function try_to_append_pending_messages()
		{
			var appended
			pending_messages.for_each(function()
			{
				if (try_to_append_message(this))
				{
					pending_messages.remove(this)
					appended = true
				}
			})
			
			if (appended)
				try_to_append_pending_messages()
		}
		
		connection.on('disconnect', function()
		{
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
				if (!try_to_append_message(this))
					pending_messages.push(this)
			})
			
			try_to_append_pending_messages()
			
			накопленные_сообщения = []
			
			if (сообщения.length > 1 || накопленные_сообщения.length > 0)
			{
				var notify = false
				сообщения.for_each(function()
				{
					if (this.отправитель._id !== пользователь._id)
						notify = true
				})
				
				if (notify)
					messages.new_messages_notification()
			}
			
			пропущенные_сообщения_учтены = true
		})
		
		var страница = page
		connection.on('готов', function()
		{
			if (страница.void)
				return
			
			connection.is_ready = true
			
			if (!connection.reconnected)
			{
				if (options.on_ready)
					options.on_ready()
					
				callback()
				
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

			connection.emit('кто здесь?')

			получить_пропущенные_сообщения()			
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
			messages.not_typing(сообщение.отправитель.имя)
			
			parse_date(сообщение, 'когда')
			
			if (сообщение.отправитель._id != пользователь._id)
				сообщение.новое = true
			
			if (!пропущенные_сообщения_учтены)
			{
				накопленные_сообщения.push(сообщение)
				return
			}
			
			if (!try_to_append_message(сообщение))
				pending_messages.push(сообщение)
			
			try_to_append_pending_messages()
		})
		
		connection.on('смотрит', function(пользователь)
		{
			delete messages.away_users[пользователь._id]
			set_status(пользователь._id, 'смотрит')
		})
		
		connection.on('не смотрит', function(пользователь)
		{
			messages.away_users[пользователь._id] = true
			set_status(пользователь._id, 'не смотрит')
		})
		
		connection.on('пишет', function(пользователь)
		{
			messages.typing(пользователь.имя)
			//set_status(пользователь._id, 'пишет', { изтекает: 1000 })
		})
		
		/*
		connection.on('error', function(ошибка)
		{
			var debug = ошибка.debug
			ошибка = ошибка.error
			
			var options = { sticky: true }
	
			report_error('messages', debug || ошибка)
		
			if (ошибка === true)
				return error('Ошибка связи с сервером', options)
	
			if (ошибка === 'Слишком много сообщений пропущено')
				return error('Не удалось догрузить сообщения. Обновите страницу.', { sticky: true })
	
			if (!ошибка)
				return
			
			console.log(ошибка)
			error(ошибка, options)
		})
		*/
		
		connection.connect()
		
		messages.connection = connection
	}
	
	messages.disconnect = function()
	{
		this.connection.disconnect()
		delete this.connection
		
		this.is_supposed_to_be_connected = false
	}
}