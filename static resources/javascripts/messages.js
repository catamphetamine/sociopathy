var Messages = new Class
({
	Implements: [Options],
	
	Binds: ['on_load', 'check_composed_message_height', 'new_messages_notification', 'dismiss_new_messages_notifications'],

	messages_to_add: [],
	
	new_messages: [],
	
	away_users: {},
	
	finished_loading: false,
	
	options:
	{
		max_messages: 42,
		new_message_sound: new Audio("/звуки/пук.ogg"),
		messages_batch_size: 18
	},
	
	initialize: function(options)
	{
		this.options.прокрутчик = прокрутчик
		this.options = $.extend(true, this.options, options)
		//this.setOptions(options) // doesn't work - mootools bug
		//this.load()
		
		page.on('focused', function()
		{
			прокрутчик.process_scroll({ first_time: true })
		})
	},
		
	create_message_element: function(data)
	{
		data.когда_примерно = неточное_время(data.когда, { blank_if_just_now: true })
		var message = $.tmpl('сообщение общения', data)
		
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
		
		this.options.render_message = this.options.render_message.bind(this)
		this.options.after_append = this.options.after_append.bind(this)
		this.options.decorate_message = this.options.decorate_message.bind(this)
		this.options.send_message = this.options.send_message.bind(this)
		
		this.initialize_loaders()
	},
	
	unload: function()
	{
		if (this.bottom_loader)
			this.bottom_loader.deactivate()
	},
	
	add_later_class: function(message, time)
	{
		if (time < Configuration.Later_messages_timing.A_little_later)
			return
		else if (time < Configuration.Later_messages_timing.Some_time_later)
			message.addClass('a_little_later')
		else if (time < Configuration.Later_messages_timing.Later)
			message.addClass('some_time_later')
		else if (time < Configuration.Later_messages_timing.More_later)
			message.addClass('later')
		else if (time < Configuration.Later_messages_timing.Reasonably_ater)
			message.addClass('more_later')
		else if (time < Configuration.Later_messages_timing.Much_later)
			message.addClass('reasonably_later')
		else
			message.addClass('much_later')
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
		
		this.loader = page.either_way_loading
		({
			data:
			{
				url: data_source_url,
				parameters: function() { return data_source_parameters },
				name: 'сообщения',
				batch_size: options.messages_batch_size,
				on_first_batch: function(data)
				{
					messages.options.environment = data.environment
					
					delete data_source_parameters.id
					data_source_parameters._id = data._id
					
					if (data.последнее_прочитанное_сообщение)
						messages.последнее_прочитанное_сообщение = data.последнее_прочитанное_сообщение
						
					//
			
					messages.new_messages_smooth_border.css('width', '100%')
					
					//
						
					if (options.on_first_time_data)
						options.on_first_time_data(data)
		
					messages.options.on_load.bind(messages)()
					messages.on_load()
				},
				on_first_output: function()
				{	
					messages.container_top_offset = messages.options.container.offset().top
					
					page.content_ready()
				},
				loaded: function(сообщения)
				{
					parse_dates(сообщения, 'когда')
					
					if (options.on_message_data)
					{
						сообщения.for_each(function()
						{
							options.on_message_data(this)
						})
					}
						
					return сообщения
				},
				before_output_async: function(elements, callback)
				{
					postprocess_rich_content(elements, callback)
				},
				finished: function()
				{
					messages.finished_loading = true
						
					if (options.on_finished)
						options.on_finished()
				},
				after_output: function(elements)
				{
					elements.for_each(function()
					{
						messages.process_message_element($(this))
					})
				},
				render: function(data)
				{
					if (messages.options.container.find('> li[message_id="' + data._id + '"]').exists())
						return
					
					var message = messages.options.render_message(data)
					
					message.attr('message_id', data._id)
					
					return message
				},
				prepend: function(message)
				{
					if (options.before_output)	
						options.before_output(message)
						
					//if (messages.options.container.find('> li[message_id="' + message.attr('message_id') + '"]').exists())
					//	return
				
					var next_new_author_in_time = messages.options.container.find('> li.new_author:first')
					
					if (next_new_author_in_time.exists() && next_new_author_in_time.attr('author') === message.attr('author'))
					{
						next_new_author_in_time.find('.author').children().remove()
						next_new_author_in_time.find('.message').css('padding-top', 0)
						
						next_new_author_in_time.removeClass('new_author')
						
						message.addClass('new_author')
						
						if (next_new_author_in_time.hasClass('odd'))
							message.addClass('odd')
						else
							message.addClass('even')
					}
					else
					{
						message.addClass('new_author')
						
						if (next_new_author_in_time.hasClass('odd'))
							message.addClass('even')
						else
							message.addClass('odd')
					}
					
					var next_in_time = messages.options.container.find('> li:first')
					if (next_in_time.exists())
					{
						var time = (next_in_time.find('.when').attr('date') - message.find('.when').attr('date')) /  1000
							
						messages.add_later_class(next_in_time, time)
					}
					
					messages.options.container.prepend(message)
					
					if (messages.options.after_output)
						messages.options.after_output(message)
				},
				append: function(message)
				{
					if (options.before_output)	
						options.before_output(message)
					
					//if (messages.options.container.find('> li[message_id="' + message.attr('message_id') + '"]').exists())
					//	return
				
					var previous_new_author_in_time = messages.options.container.find('> li.new_author:last')
				
					if (previous_new_author_in_time.exists() && previous_new_author_in_time.attr('author') === message.attr('author'))
					{
						message.find('.author').children().remove()
						message.find('.message').css('padding-top', 0)
						
						if (previous_new_author_in_time.hasClass('odd'))
							message.addClass('odd')
						else
							message.addClass('even')
					}
					else
					{
						message.addClass('new_author')
						
						if (previous_new_author_in_time.hasClass('odd'))
							message.addClass('even')
						else
							message.addClass('odd')
					}
						
					var previous_in_time = messages.options.container.find('> li:last')
					if (previous_in_time.exists())
					{
						var time = (message.find('.when').attr('date') - previous_in_time.find('.when').attr('date')) / 1000
						
						messages.add_later_class(message, time)
					}
					
					messages.options.container.append(message)
					
					if (messages.options.after_output)
						messages.options.after_output(message)
				},
				on_go_to_page: options.on_go_to_page,
				is_in_the_end: function(is_in_the_end)
				{
					console.log('In the end: ' + is_in_the_end)
					messages.is_in_the_end = is_in_the_end
				}
			},
			editable: true, 
			container: messages.options.container,
			error: 'Не удалось загрузить список сообщений',
			с_номерами_страниц: true,
			set_url: false,
			//progress_bar: true
		})
	},
	
	compose_message_height: 0,
	
	adjust_scroll_to_new_messages_popup_position: function()
	{
		if (this.compose_message.displayed())
			this.compose_message_height = this.compose_message.height()
		
		this.scroll_down_to_new_messages.css('margin-bottom', this.compose_message_height + 'px')
	},
	
	indicate_new_messages: function()
	{
		this.adjust_scroll_to_new_messages_popup_position()
		this.scroll_down_to_new_messages.fade_in(0.3, { maximum_opacity: this.scroll_down_to_new_messages_opacity })
	},
	
	indicate_no_new_messages: function()
	{
		this.scroll_down_to_new_messages.fade_out(0.3)
	},
	
	notify_new_message_recieved: function(message)
	{
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
	
	has_message: function(_id)
	{
		var has = false
		
		this.messages_to_add.for_each(function()
		{
			if (this._id === _id)
				has = true
		})
		
		if (has)
			return true
		
		return this.options.container.find('> li[message_id="' + _id + '"]').exists()
	},
	
	process_message_element: function(message)
	{
		if (!message.hasClass('new'))
			return
			
		var read = false
		
		var _id = message.attr('message_id')
		
		var handler = (function()
		{
			console.log('handle message ' + _id)
			
			if (read)
				return
			
			if (!message.hasClass('new'))
				return
		
			console.log('Focus.focused: ' + Focus.focused)
		
			if (!Focus.focused)
				return
			
			console.log('read and unwatch')
			
			this.options.прокрутчик.unwatch(message)
			
			if (this.options.on_message_bottom_appears)
				this.options.on_message_bottom_appears(_id)
			
			this.read_message(_id)
	
			message.removeClass('new')
			message.prev().removeClass('new')
		
			if (this.is_in_the_end)
			{
				var last = message.parent().children().last()
				if (!last.hasClass('new'))
				{
					this.indicate_no_new_messages()
				
					if (!Новости.есть_новости)
						this.dismiss_new_messages_notifications
				}
			}
		
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
			if (this.has_message(data._id))
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
	
		if (after.exists())
		{
			var time = (message.find('.when').attr('date') - after.find('.when').attr('date')) /  1000
			
			this.add_later_class(message, time)
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
	
				if (message.hasClass('new'))
					break
					
				delta_height += message.height()
	
				message.remove()
				this.loader.removed_message_from_top()
				
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
				
			postprocess_rich_content(message, callback)
		}
		
		append = append.bind(this)
					
		append((function()
		{
			if (!this.should_roll(message))
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
			}
			
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
		
		if (this.visual_editor)
		{
			this.visual_editor.activate()
			//this.show_editor()
			return 
		}
		
		Режим.enable_in_place_editing_tools(this.options.container)
		
		var visual_editor = new Visual_editor('#compose_message > article')
		this.visual_editor = visual_editor
		
		var send_message_timeout

		if (this.options.set_up_visual_editor)
			this.options.set_up_visual_editor.bind(this)(visual_editor)
			
		function reset_editor_content(options)
		{
			options = options || {}
			
			visual_editor.editor.content.empty()
			
			//visual_editor.editor.load_content(visual_editor.dummy_content())
		}
		
		reset_editor_content()

		function send_message(callback)
		{
			var html = visual_editor.html()
			visual_editor.empty()
			
			reset_editor_content({ not_initial: true })
			visual_editor.focus()

			function failed()
			{
				visual_editor.html(html)
				callback(false)
			}
			
			Wiki_processor.parse_and_validate(html, function(message)
			{
				//console.log('Send message: ' + message)
				
				if (!message)
					return failed()
				
				if (messages.options.send_message(message) === false)
					return failed()
				
				//reset_editor_content({ not_initial: true })
				//visual_editor.focus()
				
				messages.check_composed_message_height()
				
				callback(true)
			})
		}
		
		messages.send_message = send_message
		
		visual_editor.submit = function()
		{
			send_message(function(succeeded)
			{
				if (!succeeded)
					return
			
				// если непрочитанное сообщение было скрыто писарем,
				// и отправили своё сообщение, тем самым уменьшив высоту писаря,
				// то проверить, не видны ли теперь полностью какие-то из ранее непрочитанных сообщений
				$(document).trigger('focused')
			})
		}
		
		//visual_editor.Tools.Subheading.turn_off()
		visual_editor.initialize_tools_container()
		
		visual_editor.tools_element.on('more.visual_editor_tools', this.check_composed_message_height)
		visual_editor.tools_element.on('less.visual_editor_tools', this.check_composed_message_height)
		
		page.when_unloaded(function()
		{
			if (visual_editor)
				visual_editor.unload()
		})
	
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
				
				if (!messages.is_in_the_end)
					return
				
				messages.show_editor()
				$(document).unbind('show_visual_editor.on_demand')
			})
		}
	},
	
	on_unload: function()
	{
		this.visual_editor.deactivate()
		this.hide_editor()
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
		
		page.ticking(this.check_composed_message_height, 500)
		
		this.compose_message.fadeIn()
		
		if ($.browser.mozilla)
		{
			this.visual_editor.editor.content.focus()
		}
		
		this.visual_editor.editor.caret.move_to(this.visual_editor.editor.content.find('> *:first'))
	},
	
	should_roll: function(message)
	{
		// если список сообщений кончается ниже верхней границы области ввода сообщения - не прокручивать
		// поправка на пиксель для firefox
		var amendment = 0
		if ($.browser.mozilla)
			amendment = 1
		
		if (this.compose_message.displayed())
			this.compose_message_height = this.compose_message.height()
		
		// если нижний край сообщений ушёл за пределы окна (до добавления сообщения) - не прокручивать
		if (this.container_top_offset + (this.options.container.outerHeight() - message.outerHeight(true)) - amendment > $(window).scrollTop() + $(window).height() - this.compose_message_height)
			return false
		
		// если непрочитанные при этом уедут за верх - не прокручивать
		var first_unread = this.options.container.find('> .new:first')
		if (first_unread.exists())
		{
			var free_space_on_top = first_unread.offset().top - $(window).scrollTop()
			
			var bar = $('.who_is_connected_bar.sticky')
			if (bar.exists())
				free_space_on_top -= bar.height()
				
			if (free_space_on_top < message.outerHeight(true))
				return false
		}
		
		return true
	},
	
	lift_messages_by: function(how_much)
	{
		if (this.options.container.css('margin-bottom') === how_much + 'px')
			return
			
		this.options.container.css('margin-bottom', how_much + 'px')
		this.options.container.next('.typing').css('margin-top', -how_much + 'px')
	},
	
	check_composed_message_height: function()
	{
		var scroll = false
		if (прокрутчик.in_the_end())
		{
			scroll = true
		}
		
		this.lift_messages_by(this.compose_message.height())
		
		if (scroll)
		{
			прокрутчик.to_the_end()
		}

		this.adjust_scroll_to_new_messages_popup_position()
	},
	
	new_messages_notification: function()
	{
		if (!Focus.focused)
			if (this.options.new_message_sound)
				this.options.new_message_sound.play()
		
		window_notification.something_new()
	},
	
	dismiss_new_messages_notifications: function()
	{
		window_notification.nothing_new()
	}
})