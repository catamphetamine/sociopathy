(function()
{
	title('Болталка')
	
	var chat
	var who_is_online_bar_list
	
	var new_messages_smooth_border
	
	var Max_chat_messages = 100
	var Messages_batch_size = 32
	
	var away_users = {}
	
	var кто_в_болталке = {}
	кто_в_болталке[пользователь._id] = true
	
	var chat_top_offset
	
	var is_away = false
	
	var new_message_sound = new Audio("/звуки/new message.ogg")
	var alarm_sound = new Audio("/звуки/alarm.ogg")
	
	var compose_message
	//var chat_lifter
	
	var scroll_down_to_new_messages
	var scroll_down_to_new_messages_opacity
	
	var new_messages = []
		
	page.load = function()
	{
		new_messages_smooth_border = $('.new_messages_smooth_border')
	
		Подсказки.подсказка('Здесь вы можете разговаривать с другими членами сети.')
		Подсказки.ещё_подсказка('Вверху вы видите список людей, у которых сейчас открыта болталка.')
		Подсказки.ещё_подсказка('Также, в списке сообщений, пользователи, у которых сейчас открыта болталка, подсвечены зелёным.')
		
		chat = $('.chat')
		var more_link = $('#chat_container').find('.older > a')
		compose_message = $('#compose_message')
		
		scroll_down_to_new_messages = $('.scroll_down_to_new_messages')
		scroll_down_to_new_messages_opacity = scroll_down_to_new_messages.css('opacity') || 1
			
		var loader = new Batch_loader
		({
			url: '/приложение/болталка/сообщения',
			batch_size: Messages_batch_size,
			get_data: function (data)
			{
				parse_dates(data.сообщения, 'время')
				return data.сообщения
			},
			before_done: function() { ajaxify_internal_links(chat) },
			before_done_more: function() { ajaxify_internal_links(chat) },
			done: chat_loaded,
			done_more: function()
			{
				if (this.есть_ли_ещё)
					more_link.fadeIn(300)
			},
			finished: function()
			{
				more_link.hide()
			}
		})
		
		function show_more_messages(event)
		{
			event.preventDefault()
			loader.deactivate()
			var indicate_loading = loader.load_more()
			
			var latest = loader.latest
			more_link.fade_out(0.2, function()
			{
				if (loader.latest === latest)
					indicate_loading()
			})
		}
		
		loader.activate = function() { more_link.on('click', show_more_messages) }
		loader.deactivate = function() { more_link.unbind() }
			
		var conditional = $('#chat_block')
	
		new Data_templater
		({
			template_url: '/страницы/кусочки/сообщение в болталке.html',
			container: chat,
			conditional: conditional,
			postprocess_element: function(item)
			{
				var author = item.find('.author')
				if (is_online(author.attr('author')))
					author.addClass('online')
				
				item.find('.text').find('a').attr('target', '_blank')
					
				return item
			},
			show: function(data, options)
			{
				data.show_online_status = true
				var item = $.tmpl(options.template_url, data)
				item.find('.popup_menu_container').prependTo(item)
	
				item = options.postprocess_element(item)

				if (away_users[data.отправитель._id])
					item.find('.author').addClass('is_away')
				
				var next_in_time = chat.find('> li:first')
				if (next_in_time.attr('author') === data.отправитель._id)
				{
					next_in_time.find('.author').children().remove()
					next_in_time.find('.message').css('padding-top', 0)
					next_in_time.removeClass('new_author')
				}
				
				item.addClass('new_author')
				chat.prepend(item)

				// после preprend, т.к. стили				
				if (data.отправитель._id !== пользователь._id)
					initialize_call_action(item, item.attr('author'), 'of_message_author', function() { return item.find('.author').hasClass('online') })
			},
			order: 'обратный'
		},
		loader)
		
		$(window).on_page('scroll.chat', function()
		{
			check_if_there_are_still_unread_messages()
		})
		
		// таким образом мы исправим случай, когда поле ввода было большим при скролле,
		// но потом уменьшилось при удалении всего, и табличка о новых сообщениях осталась висеть
		page.ticking(check_if_there_are_still_unread_messages, 1000)
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
	
	function check_if_there_are_still_unread_messages()
	{
		iterate(new_messages, function(message)
		{
			return message.is_visible_on_screen({ fully: true })
		},
		function()
		{
			if (new_messages.is_empty())
				indicate_no_new_messages()
		})
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
	
	var messages_to_add = []
	function add_message(data)
	{
		if (!data)
		{
			if (messages_to_add.is_empty())
				return
				
			data = messages_to_add[0]
		}
		else
		{
			messages_to_add.push(data)
			if (messages_to_add.length > 1)
				return
		}
		
		var previous = chat.find('> li:last')
		var same_author = (previous.attr('author') === data.отправитель._id)
		
		data.show_online_status = true
		var content = $.tmpl('/страницы/кусочки/сообщение в болталке.html', data)
		
		var this_author = content.find('.author')
		var this_message = content.find('.message')
	
		if (away_users[data.отправитель._id])
			this_author.addClass('is_away')
		
		if (same_author)
		{
			this_author.children().remove()
			this_message.css('padding-top', 0)
		}
	
		// вывести снизу следующее новое сообщение
		var next = function()
		{
			messages_to_add.shift()
			add_message()
			remove_old_messages()
		}
		
		// убрать сверху лишние сообщения
		var remove_old_messages = function()
		{
			var chat_messages = chat.find('> li')
			var delta_height = 0
			
			var delta_messages = chat_messages.length - Max_chat_messages
			var i = 0
			while (delta_messages > 0)
			{
				var message = chat_messages.eq(i)
				delta_height += message.height()
	
				message.remove()
				
				delta_messages--
				i++
			}
			
			return delta_height		
		}
		
		var is_another_users_message = data.отправитель._id !== пользователь._id
		
		if (is_another_users_message)
			content.addClass('new_author')
		
		var append = function()
		{
			content.appendTo(chat)
			
			ajaxify_internal_links(content)
			
			// после append'а, т.к. стили
			if (is_another_users_message)
				initialize_call_action(content, content.attr('author'), 'of_message_author', function() { return this_author.hasClass('online') })
		}
		
		if (!should_roll())
		{
			append()
			
			// прокрутить на величину убранных сообщений
			$(window).scrollTop($(window).scrollTop() - remove_old_messages())
			
			if (is_another_users_message)
				notify_new_message_recieved(content)
			
			return next()
		}
		
		append()
		прокрутчик.scroll_to(chat, { top_offset: chat_top_offset, bottom: true, duration: 700 }, function()
		{
			remove_old_messages()
			next()
		})
	}
	
	function indicate_new_messages()
	{
		scroll_down_to_new_messages.fade_in(0.3, { maximum_opacity: scroll_down_to_new_messages_opacity })
	}
	
	function indicate_no_new_messages()
	{
		scroll_down_to_new_messages.fade_out(0.3)
	}
	
	function notify_new_message_recieved(message)
	{
		new_messages.push(message)
		indicate_new_messages()
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
	
	function chat_loaded()
	{
		chat_top_offset = chat.offset().top
	
		new_messages_smooth_border.css('width', '100%')
		
		//show_testing_messages()
	
		who_is_online_bar_list = $('.who_is_online')
		$('.who_is_online_bar').floating_top_bar()
		
		connect_to_chat(function()
		{
			$(window).on_page('focus.chat', function()
			{
				is_away = false
				dismiss_new_messages_notifications()
				болталка.emit('смотрит')
			})
			
			$(window).on_page('blur.chat', function()
			{
				is_away = true
				болталка.emit('не смотрит')
			})
			
			var visual_editor = new Visual_editor('#compose_message > article')
			
			var send_message_timeout
	
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
			
			visual_editor.on_break = function()
			{
				var node = document.createTextNode(' ')
				visual_editor.editor.content[0].appendChild(node)
				visual_editor.editor.caret.move_to(node)
			}
	
			function send_message()
			{
				var message = visual_editor.editor.content.html().trim()
				if (!message)
					return
					
				visual_editor.editor.content.html(editor_initial_html)
				visual_editor.editor.caret.move_to(visual_editor.editor.content[0].firstChild)
				
				болталка.emit('сообщение', message)
			}
			
			visual_editor.enter_pressed_in_container = function()
			{
				send_message()
				check_if_there_are_still_unread_messages()
			}
			
			visual_editor.enter_pressed = function(result)
			{
				send_message()
				check_if_there_are_still_unread_messages()
			}
			
			var hint = $('<p/>').appendTo(visual_editor.editor.content)
			visual_editor.tagged_hint(hint, 'Вводите сообщение здесь')
			
			var editor_initial_html = visual_editor.editor.content.html()
			
			visual_editor.Tools.Subheading.turn_off()
			visual_editor.initialize_tools_container()
			
			visual_editor.tools_element.on('more.visual_editor_tools', adjust_chat_listing_margin)
			visual_editor.tools_element.on('less.visual_editor_tools', adjust_chat_listing_margin)
			
			visual_editor.show_tools()
			
			if ($.browser.mozilla)
				visual_editor.editor.content.focus()
			
			//adjust_chat_listing_margin()
			page.ticking(adjust_chat_listing_margin, 1000)
			
			compose_message.fadeIn()
			
			visual_editor.editor.caret.move_to(visual_editor.editor.content.find('> *:first'))
		})
	}
	
	function should_roll()
	{
		// если список сообщений кончается ниже верхней границы области ввода сообщения - не прокручивать
		// поправка на пиксель для firefox
		var amendment = 0
		if ($.browser.mozilla)
			amendment = 1
			
		if (chat_top_offset + chat.outerHeight() - amendment > $(window).scrollTop() + $(window).height() - compose_message.height())
			return false
		
		return true
	}
	
	function lift_chat_by(how_much)
	{
		if (chat.css('margin-bottom') === how_much + 'px')
			return
			
		chat.css('margin-bottom', how_much + 'px')
	}
	
	function adjust_chat_listing_margin()
	{
		lift_chat_by(compose_message.height())
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
			/*
			if (своё)
				clearTimeout(send_message_timeout)
			*/
			
			if (is_away)
				new_messages_notification()
		
			add_message(преобразовать_время(данные))
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

	//var attention_symbol = '•'
	var attention_symbol = '•'
	
	function new_messages_notification()
	{
		// 
		if (title().indexOf(attention_symbol) !== 0)
			title(attention_symbol + title())
			
		new_message_sound.play()
	}
	
	function dismiss_new_messages_notifications()
	{
		if (document.title.indexOf(attention_symbol) === 0)
			document.title = document.title.substring(1)
	}
})()