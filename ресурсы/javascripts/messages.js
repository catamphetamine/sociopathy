var Messages = new Class
({
	Implements: [Options],
	
	Binds: ['check_if_there_are_still_unread_messages', 'on_load', 'adjust_listing_margin', 'new_messages_notification', 'dismiss_new_messages_notifications'],

	messages_to_add: [],
	
	new_messages: [],
	
	away_users: {},
	
	on_load_actions: [],
	
	options:
	{
		max_messages: 200,
		new_message_sound: new Audio("/звуки/new message.ogg"),
		messages_batch_size: 18,
		check_if_there_are_still_unread_messages_interval: 1000
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
	
		//this.load()	
	},
		
	load: function()
	{
		this.new_messages_smooth_border = $('.new_messages_smooth_border')

		this.compose_message = $('#compose_message')
		
		var messages = this
		
		this.scroll_down_to_new_messages = $('.scroll_down_to_new_messages')
		this.scroll_down_to_new_messages_opacity = this.scroll_down_to_new_messages.css('opacity') || 1
		this.scroll_down_to_new_messages.on('click', function(event)
		{
			event.preventDefault()
			прокрутчик.scroll_to_bottom()
			messages.indicate_no_new_messages()
		})
		
		this.options.prepend_message = this.options.prepend_message.bind(this)
		this.options.after_append = this.options.after_append.bind(this)
		this.options.construct_message = this.options.construct_message.bind(this)
		this.options.send_message = this.options.send_message.bind(this)
		
		this.initialize_loaders()
		
		$(window).on_page('scroll.messages', function()
		{
			messages.check_if_there_are_still_unread_messages()
		})

		// таким образом мы исправим случай, когда поле ввода было большим при скролле,
		// но потом уменьшилось при удалении всего, и табличка о новых сообщениях осталась висеть
		page.ticking(this.check_if_there_are_still_unread_messages, this.options.check_if_there_are_still_unread_messages_interval)
	},
		
	initialize_loaders: function()
	{
		var messages = this
		var options = this.options
		
		var data_source_url
		var data_source_parameters = {}
		
		if (typeof options.data_source === 'object')
		{
			data_source_url = options.data_source.url
			
			if (options.data_source.parameters)
				data_source_parameters = options.data_source.parameters
		}
		
		var first_time_data = true
		
		var loader = new Batch_loader
		({
			url: data_source_url,
			parameters: data_source_parameters,
			batch_size: options.messages_batch_size,
			get_data: function(data)
			{
				if (options.on_first_time_data)
					if (first_time_data)
						options.on_first_time_data(data)
					
				if (options.on_data)
					options.on_data(data)
					
				first_time_data = false
				
				parse_dates(data.сообщения, 'когда')
				return data.сообщения
			},
			before_done: function() { ajaxify_internal_links(options.container) },
			before_done_more: function() { ajaxify_internal_links(options.container) },
			done: function()
			{
				messages.container_top_offset = messages.options.container.offset().top
		
				messages.new_messages_smooth_border.css('width', '100%')
			
				messages.options.on_load.bind(messages)(messages.on_load)
			},
			done_more: function()
			{
				if (this.есть_ли_ещё)
					options.more_link.fade_in(0.1)
			},
			finished: function()
			{
				options.more_link.fade_out(0.1)
			}
		})
		
		function show_more_messages(event)
		{
			event.preventDefault()
			loader.deactivate()
			var indicate_loading = loader.load_more()
			
			var latest = loader.latest
			options.more_link.fade_out(0.2, function()
			{
				if (loader.latest === latest)
					indicate_loading()
			})
		}
		
		loader.activate = function() { options.more_link.on('click', show_more_messages) }
		loader.deactivate = function() { options.more_link.unbind() }
			
		var conditional = $('#chat_block')
	
		new Data_templater
		({
			conditional: conditional,
			show: function(data, options)
			{
				function prepend(message)
				{
					var next_in_time = messages.options.container.find('> li.new_author:first')
					
					if (next_in_time.attr('author') === data.отправитель._id)
					{
						next_in_time.find('.author').children().remove()
						next_in_time.find('.message').css('padding-top', 0)
						
						next_in_time.removeClass('new_author')
						
						message.addClass('new_author')
						
						if (next_in_time.hasClass('odd'))
							message.addClass('odd')
						else
							message.addClass('even')
					}
					else
					{
						message.addClass('new_author')
						
						if (next_in_time.hasClass('odd'))
							message.addClass('even')
						else
							message.addClass('odd')
					}
				
					messages.options.container.prepend(message)
				}
				
				messages.options.prepend_message(data, prepend)
			},
			order: 'обратный'
		},
		loader)
	},
	
	check_if_there_are_still_unread_messages: function()
	{
		var messages = this
		iterate(messages.new_messages, function(message)
		{
			return message.is_visible_on_screen({ fully: true })
		},
		function()
		{
			if (messages.new_messages.is_empty())
				messages.indicate_no_new_messages()
		})
	},
	
	indicate_new_messages: function()
	{
		this.scroll_down_to_new_messages.fade_in(0.3, { maximum_opacity: this.scroll_down_to_new_messages_opacity })
	},
	
	indicate_no_new_messages: function()
	{
		this.scroll_down_to_new_messages.fade_out(0.3)
	},
	
	notify_new_message_recieved: function(message)
	{
		this.new_messages.push(message)
		this.indicate_new_messages()
	},
	
	add_message: function(data)
	{
		if (!data)
		{
			if (this.messages_to_add.is_empty())
				return
				
			data = this.messages_to_add[0]
		}
		else
		{
			this.messages_to_add.push(data)
			if (this.messages_to_add.length > 1)
				return
		}
		
		var previous = this.options.container.find('> li:last')
		var same_author = (previous.attr('author') === data.отправитель._id)
		
		var message
		
		if (this.options.template)
			message = $.tmpl(this.options.template, data)
		else
			message = this.options.construct_message(data)
	
		if (same_author)
		{
			message.find('.author').children().remove()
			message.find('.message').css('padding-top', 0)
			
			if (previous.hasClass('odd'))
				message.addClass('odd')
			else
				message.addClass('even')
		}
		else
		{
			message.addClass('new_author')
			
			if (previous.hasClass('odd'))
				message.addClass('even')
			else
				message.addClass('odd')
		}

		// убрать сверху лишние сообщения
		var remove_old_messages = function()
		{
			var messages = this.options.container.find('> li')
			var delta_height = 0
			
			var delta_messages = messages.length - this.options.max_messages
			var i = 0
			while (delta_messages > 0)
			{
				var message = messages.eq(i)
				delta_height += message.height()
	
				message.remove()
				
				delta_messages--
				i++
			}
			
			return delta_height		
		}
		
		remove_old_messages = remove_old_messages.bind(this)
		
		// вывести снизу следующее новое сообщение
		var next = function()
		{
			this.messages_to_add.shift()
			this.add_message()
			
			if (typeof this.options.max_messages !== 'undefined')
				remove_old_messages()
		}
		
		next = next.bind(this)
		
		var is_another_users_message = data.отправитель._id !== пользователь._id
		
		var append = function()
		{
			message.appendTo(this.options.container)
			
			ajaxify_internal_links(message)
			
			if (this.options.after_append)
				this.options.after_append(message, data)
		}
		
		append = append.bind(this)
		
		if (!this.should_roll())
		{
			append()
			
			// прокрутить на величину убранных сообщений
			if (typeof this.options.max_messages !== 'undefined')
			{
				var delta_height = remove_old_messages()
				$(window).scrollTop($(window).scrollTop() - delta_height)
			}
			
			if (is_another_users_message)
				this.notify_new_message_recieved(message)
			
			return next()
		}
		
		append()
		this.options.scroller.scroll_to(this.options.container, { top_offset: this.container_top_offset, bottom: true, duration: 700 }, function()
		{
			remove_old_messages()
			next()
		})
	},

	on_load: function()
	{
		var messages = this
		
		this.on_load_actions.for_each(function() { this.bind(messages)() })
		
		var visual_editor = new Visual_editor('#compose_message > article')
		
		var send_message_timeout

		if (this.options.set_up_visual_editor)
			this.options.set_up_visual_editor.bind(this)(visual_editor)
		
		visual_editor.on_break = function()
		{
			var node = document.createTextNode(' ')
			visual_editor.editor.content[0].appendChild(node)
			visual_editor.editor.caret.move_to(node)
		}
		
		var hint = $('<p/>').appendTo(visual_editor.editor.content)
		visual_editor.tagged_hint(hint, 'Вводите сообщение здесь')
		
		var editor_initial_html = visual_editor.editor.content.html()

		function send_message()
		{
			var message = visual_editor.editor.content.html().trim()
			if (!message)
				return
				
			visual_editor.editor.content.html(editor_initial_html)
			visual_editor.editor.caret.move_to(visual_editor.editor.content[0].firstChild)
			
			messages.options.send_message(message)
		}
		
		visual_editor.enter_pressed_in_container = function()
		{
			send_message()
			messages.check_if_there_are_still_unread_messages()
		}
		
		visual_editor.enter_pressed = function(result)
		{
			send_message()
			messages.check_if_there_are_still_unread_messages()
		}
		
		visual_editor.Tools.Subheading.turn_off()
		visual_editor.initialize_tools_container()
		
		visual_editor.tools_element.on('more.visual_editor_tools', this.adjust_listing_margin)
		visual_editor.tools_element.on('less.visual_editor_tools', this.adjust_listing_margin)
		
		this.visual_editor = visual_editor
		
		if (this.options.show_editor)
			this.show_editor()
	},

	show_editor: function()
	{
		this.visual_editor.show_tools()
		
		if ($.browser.mozilla)
			this.visual_editor.editor.content.focus()
		
		page.ticking(this.adjust_listing_margin, 1000)
		
		this.compose_message.fadeIn()
		
		this.visual_editor.editor.caret.move_to(this.visual_editor.editor.content.find('> *:first'))
	},
	
	should_roll: function()
	{
		// если список сообщений кончается ниже верхней границы области ввода сообщения - не прокручивать
		// поправка на пиксель для firefox
		var amendment = 0
		if ($.browser.mozilla)
			amendment = 1
			
		if (this.container_top_offset + this.options.container.outerHeight() - amendment > $(window).scrollTop() + $(window).height() - this.compose_message.height())
			return false
		
		return true
	},
	
	lift_messages_by: function(how_much)
	{
		if (this.options.container.css('margin-bottom') === how_much + 'px')
			return
			
		this.options.container.css('margin-bottom', how_much + 'px')
	},
	
	adjust_listing_margin: function()
	{
		this.lift_messages_by(this.compose_message.height())
	},
	
	//var attention_symbol = '•'
	attention_symbol: '•',
	
	new_messages_notification: function()
	{
		if (title().indexOf(this.attention_symbol) !== 0)
			title(this.attention_symbol + title())
			
		this.options.new_message_sound.play()
	},
	
	dismiss_new_messages_notifications: function()
	{
		if (document.title.indexOf(this.attention_symbol) === 0)
			document.title = document.title.substring(1)
	}
})