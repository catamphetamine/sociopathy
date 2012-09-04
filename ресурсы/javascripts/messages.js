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
		new_message_sound: new Audio("/звуки/пук.ogg"),
		messages_batch_size: 18,
		check_if_there_are_still_unread_messages_interval: 1000,
	},
	
	initialize: function(options)
	{
		this.options.прокрутчик = прокрутчик
		this.options = $.extend(true, this.options, options)
		//this.setOptions(options) // doesn't work - mootools bug
		//this.load()
		
		page.on('focused.messages', function()
		{
			прокрутчик.process_scroll({ first_time: true })
		})
	},
		
	create_message_element: function(data)
	{
		data.когда_примерно = неточное_время(data.когда)
		var message = $.tmpl('сообщение в болталке', data)
		
		if (data.новое)
			message.addClass('new')
			
		return message
	},
	
	load: function()
	{
		this.new_messages_smooth_border = $('.new_messages_smooth_border')

		var messages = this
		
		this.compose_message = $('#compose_message')
		
		this.compose_message.click(function()
		{
			 //messages.compose_message.find('> article').focus()
		})
		
		this.scroll_down_to_new_messages = $('.scroll_down_to_new_messages')
		this.scroll_down_to_new_messages_opacity = this.scroll_down_to_new_messages.css('opacity') || 1
		this.scroll_down_to_new_messages.on('click', function(event)
		{
			event.preventDefault()
			messages.options.прокрутчик.scroll_to_bottom()
			messages.indicate_no_new_messages()
		})
		
		this.options.prepend_message = this.options.prepend_message.bind(this)
		this.options.after_append = this.options.after_append.bind(this)
		this.options.decorate_message = this.options.decorate_message.bind(this)
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
	
	unload: function()
	{	
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
					
				if (first_time_data)
				{
					messages.options.environment = data.environment
					
					if (data.последнее_прочитанное_сообщение)
						messages.последнее_прочитанное_сообщение = data.последнее_прочитанное_сообщение
				}
				
				first_time_data = false
				
				parse_dates(data.сообщения, 'когда')
				
				if (options.on_message_data)
					data.сообщения.for_each(function()
					{
						options.on_message_data(this)
					})
					
				return data.сообщения
			},
			before_done: function() { ajaxify_internal_links(options.container) },
			before_done_more: function() { ajaxify_internal_links(options.container) },
			before_output: function(callback)
			{
				refresh_formulae({ where: options.container }, callback)
			},
			done: function()
			{
				messages.container_top_offset = messages.options.container.offset().top
		
				messages.new_messages_smooth_border.css('width', '100%')
				
				messages.options.on_load.bind(messages)()
				messages.on_load()
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
			
			if (!options.can_show_earlier_messages())
				return
			
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
			
		var conditional = $('.main_conditional')
	
		new Data_templater
		({
			conditional: conditional,
			show: function(data, options)
			{
				if (messages.options.container.find('> li[message_id="' + data._id + '"]').exists())
					return
				
				function prepend(message)
				{
					if (messages.options.container.find('> li[message_id="' + message.attr('message_id') + '"]').exists())
						return
				
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
				
					message.attr('message_id', data._id)
					
					messages.options.container.prepend(message)
				}
				
				return messages.options.prepend_message(data, prepend)
			},
			after_all_shown: function(elements)
			{
				elements.for_each(function()
				{
					messages.process_message_element($(this))
				})
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
	
	render: function(data)
	{
		if (this.options.template)
			return $.tmpl(this.options.template, data)
		
		var message = this.create_message_element(data)
		this.options.decorate_message(message, data)
		return message
	},
	
	prepare_message_for_insertion: function(previous, data)
	{
		var message = this.render(data)
		
		message.attr('message_id', data._id)
		
		var same_author = (previous.attr('author') === data.отправитель._id)
		
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
		
		return message
	},
	
	has_message: function(data)
	{
		var has = false
		
		this.messages_to_add.for_each(function()
		{
			if (this._id === data._id)
				has = true
		})
		
		if (has)
			return true
		
		return this.options.container.find('> li[message_id="' + data._id + '"]').exists()
	},
	
	process_message_element: function(message)
	{
		if (!message.hasClass('new'))
			return
		
		var read = false
		
		var _id = message.attr('message_id')
		
		var handler = (function()
		{
			if (!Focus.focused)
				return
		
			//this.options.прокрутчик.unwatch(message)
		
			if (this.options.on_message_bottom_appears)
				this.options.on_message_bottom_appears(_id)
				
			if (read)
				return
			
			if (!this.read_message(_id))
				return 
					
			if (this.options.on_message_read)
				this.options.on_message_read(_id)
		
			message.removeClass('new')
		
			read = true
		})
		.bind(this)
		
		message.on('bottom_appears', handler)
		message.on('fully_visible', handler)
		
		message.data('прокрутчик.get_bottom_margin', function()
		{
			var compose_message = $('#compose_message')
			if (!compose_message.exists())
				return 0
				
			if (compose_message.css('display') === 'none')
				return 0
				
			return compose_message.outerHeight()
		})
		
		this.options.прокрутчик.watch(message)
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
			if (this.has_message(data))
				return
			
			this.messages_to_add.push(data)
			if (this.messages_to_add.length > 1)
				return
		}
		
		var after
		
		if (data.after)
		{
			if (data.after instanceof jQuery)
				after = data.after
			else
				after = this.options.container.find('> li[message_id="'+ data.after + '"]')
		}
		
		if (!after || !after.exists())
			after = this.options.container.find('> li:last')
			
		var message = this.prepare_message_for_insertion(after, data)
	
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
	
		var append = function(callback)
		{
			message.appendTo(this.options.container)
		
			this.process_message_element(message)
			
			ajaxify_internal_links(message)
			
			if (this.options.after_append)
				this.options.after_append(message, data)
				
			refresh_formulae({ where: message }, callback)
		}
		
		append = append.bind(this)
					
		if (!this.should_roll())
		{
			append((function()
			{
				// прокрутить на величину убранных сообщений
				if (typeof this.options.max_messages !== 'undefined')
				{
					var delta_height = remove_old_messages()
					$(window).scrollTop($(window).scrollTop() - delta_height)
				}
				
				if (is_another_users_message)
					this.notify_new_message_recieved(message)
				
				return next()
			})
			.bind(this))
		}
		
		append((function()
		{
			this.options.прокрутчик.scroll_to(this.options.container, { top_offset: this.container_top_offset, bottom: true, duration: 700 }, function()
			{
				remove_old_messages()
				next()
			})
		})
		.bind(this))
	},

	on_load: function()
	{
		var messages = this
		
		var visual_editor = new Visual_editor('#compose_message > article')
		this.visual_editor = visual_editor
		
		var send_message_timeout

		if (this.options.set_up_visual_editor)
			this.options.set_up_visual_editor.bind(this)(visual_editor)
		
		/*
		visual_editor.on_break = function()
		{
			var node = document.createTextNode(' ')
			visual_editor.editor.content[0].appendChild(node)
			visual_editor.editor.caret.move_to(node)
		}
		*/
		
		visual_editor.paragraphed()
		
		var hint = $('<p/>').appendTo(visual_editor.editor.content)
		visual_editor.hint(hint, 'Вводите сообщение здесь')
		//visual_editor.tagged_hint(hint, 'Вводите сообщение здесь')
		visual_editor.store_content()
		
		var editor_initial_html = visual_editor.editor.content.html()

		function send_message()
		{
			var message = Wiki_processor.parse(visual_editor.editor.content.html())
			if (!message)
				return
				
			if (messages.options.send_message(message) === false)
			{
				return warning('Потеряно соединение с сервером')
			}
			
			visual_editor.editor.content.html(editor_initial_html)
			visual_editor.focus()
			
			messages.adjust_listing_margin()
		}
		
		visual_editor.ctrl_enter_pressed_in_container = function()
		{
			if (!send_message())
				return
				
			messages.check_if_there_are_still_unread_messages()
		}
		
		/*
		visual_editor.enter_pressed = function(result)
		{
			send_message()
			messages.check_if_there_are_still_unread_messages()
		}
		*/
		
		//visual_editor.Tools.Subheading.turn_off()
		visual_editor.initialize_tools_container()
		
		visual_editor.tools_element.on('more.visual_editor_tools', this.adjust_listing_margin)
		visual_editor.tools_element.on('less.visual_editor_tools', this.adjust_listing_margin)
		
		this.visual_editor = visual_editor
		
		if (this.options.show_editor)
		{
			this.show_editor()
		}
		else
		{
			$(document).on('show_visual_editor.on_demand', function()
			{
				if (messages.options.can_show_editor)
					if (!messages.options.can_show_editor())
						return
					
				messages.show_editor()
				$(document).unbind('show_visual_editor.on_demand')
			})
		}
		
		this.on_load_actions.for_each(function() { this.bind(messages)() })
	},

	hide_editor: function()
	{
		this.visual_editor.hide_tools()
		
		$('body').focus()
			
		this.compose_message.fadeOut()
	},

	show_editor: function()
	{
		this.visual_editor_was_shown = true
		
		this.visual_editor.show_tools()
		
		page.ticking(this.adjust_listing_margin, 1000)
		
		this.compose_message.fadeIn()
		
		if ($.browser.mozilla)
		{
			this.visual_editor.editor.content.focus()
		}
		
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
	
	new_messages_notification: function()
	{
		if (this.options.new_message_sound)
			this.options.new_message_sound.play()
				
		window_notification.something_new()
	},
	
	dismiss_new_messages_notifications: function()
	{	
		window_notification.nothing_new()
	}
})