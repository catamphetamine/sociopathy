var Interactive_messages = function(options)
{
	var interactive_messages_options = options
	
	var Who_is_connected_bar_fade_in_duration = 0.8
	var Who_is_connected_bar_fade_out_duration = 0.5
	
	var away_users = {}
	
	page.подсказка('написание сообщения', 'Для того, чтобы написать сообщение, нажмите клавишу <a href=\'/сеть/настройки\'>«' + Настройки.Клавиши.Писарь.Показать + '»</a>, и внизу появится поле ввода сообщения. Для отправки сообщения нажмите клавиши «Ctrl + Enter».')
	page.подсказка('правка сообщений', 'Вы можете править свои сообщения, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a> (клавиша «' + Настройки.Клавиши.Режимы.Правка + '»)')

	var messages = new Messages
	({
		data_source: options.data_source,
		render_message: function(data)
		{
			var message = this.render(data)
			
			message.find('.popup_menu_container').prependTo(message)
			
			var author = message.find('.author')
			if (this.is_connected(author.attr('author')))
				author.addClass('connected')
			
			message.find('.text').find('a').attr('target', '_blank')
			
			if (away_users[data.отправитель._id])
				message.find('.author').addClass('is_away')
			
			if (data.отправитель._id !== пользователь._id)
				message.attr('another_author', true)
				
			return message
		},
		more_link: options.more_link,
		can_show_earlier_messages: options.can_show_earlier_messages,
		can_show_editor: options.can_show_editor,
		container: options.container,
		on_message_bottom_appears: options.on_message_bottom_appears,
		set_up_visual_editor: function(visual_editor)
		{
			if (options.set_up_visual_editor)
				options.set_up_visual_editor.bind(this)(visual_editor)
			
			var messages = this
			
			var can_signal_typing = true
			// html5 input event seems to be unsupported
			visual_editor.editor.on('content_changed.editor', function(event)
			{
				if (!can_signal_typing)
					return
				
				if (visual_editor.editor.is_empty() || visual_editor.is_dummy_content())
					return
				
				// можно слать такие сообщения максимум раз в пол-секунды
				can_signal_typing = false
				var unlocker = function()
				{
					can_signal_typing = true
				}
				unlocker.delay(500)
				
				//if (visual_editor.editor.is_empty())
				//	console.log ('стёр')
				
				if (messages.connected())
					messages.connection.emit('пишет')
			})
		},
		decorate_message: function(message, data)
		{
			if (away_users[data.отправитель._id])
				message.find('.author').addClass('is_away')
		},
		send_message: function(message)
		{
			if (!this.connected())
			{
				if (!this.is_supposed_to_be_connected)
					// never happens
					info(text('messages.error.unable to send message while browsing'))
				else
					info(text('websocket.error.connection lost'))
				
				return false
			}
		
			this.connection.emit('сообщение', message)
			return true
		},
		after_output: function(message, data)
		{
			// после output, т.к. стили				
			if (message.attr('another_author') == true)
			{
				messages.initialize_user_actions(message, message.attr('author'), 'of_message_author', function()
				{
					return message.find('.author').hasClass('online')
				})
			}
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
		on_message_data: options.on_message_data,
		on_first_time_data: options.on_first_time_data,
		on_finished: function()
		{
			messages.connect(function()
			{
				$(window).on_page('focus.messages', function()
				{
					if (messages.connected())
						messages.connection.emit('смотрит')
				})
				
				$(window).on_page('blur.messages', function()
				{
					if (messages.connected())
						messages.connection.emit('не смотрит')
				})
				
				old_on_load()
			})
		},
		on_go_to_page: function()
		{
			if (messages.connection)
			{
				messages.disconnect()
				
				page.get('.who_is_connected').empty()
			}
		}
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
			
			if (!messages.connected())
				return warning(text('websocket.error.connection lost'))
		
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

	function get_last_message_id()
	{
		var last_message = messages.options.container.find('> li:last')
		
		if (!last_message.exists())
			return
			
		return last_message.attr('message_id')
	}
	
	messages.connected = (function()
	{
		return this.connection && this.connection.is_ready
	})
	.bind(messages)
	
	messages.read_message = function(_id)
	{
		/*
		if (options.info)
		{
			if (options.info.что)
			{
				var info = { что: options.info.что, _id: _id.toString() }
				
				if (options.info.общение)
					info.сообщения_чего = options.info.общение()
				
				Inter_tab_communication.send('новости_прочитано', info)
			}
		}
		*/
		
		if (this.connected())	
			this.connection.emit('прочитано', _id)
		else
			this.отметить_прочитанным(_id)
	}
	.bind(messages)
	
	messages.отметить_прочитанным = function(_id)
	{
		if (!this.какое_отметить_прочитанным)
			return this.какое_отметить_прочитанным = _id
		
		if (_id > this.какое_отметить_прочитанным)
			this.какое_отметить_прочитанным = _id
	}
	.bind(messages)
	
	var message_status_update_error_shown = false
	
	messages.отправить_уведомление_о_прочтении = function()
	{
		if (!this.какое_отметить_прочитанным)
			return
			
		var finish = function()
		{
			delete this.какое_отметить_прочитанным
		}
		.bind(this)
			
		if (this.connected())
		{
			this.connection.emit('прочитано', this.какое_отметить_прочитанным)
			return finish()
		}
		
		var data =
		{
			_id: this.какое_отметить_прочитанным,
			вид: options.info.что
		}
		
		if (this.options.environment.сообщения_чего)
		{
			data.общение = this.options.environment.сообщения_чего._id
		}
		
		page.Ajax.post('/сеть/эфир/сообщение прочитано', data).ok(finish).ошибка(function()
		{
			if (!message_status_update_error_shown)
			{
				warning(text('messages.error.message read status update failed'), { sticky: true })
				message_status_update_error_shown = true
			}
			
			finish()
		})
	}
	.bind(messages)
	
	messages.ticking_message_read_poster = messages.отправить_уведомление_о_прочтении.ticking(1000)
	
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
		messages.who_is_connected_bar_list.parent().hide().transparent().floating_top_bar()
		
		messages.unload = function()
		{
			if (messages.who_is_connected_bar_list)
				messages.who_is_connected_bar_list.parent().floating_top_bar('unload')
			
			if (messages.connection)
				messages.disconnect()
			
			if (messages.ticking_message_read_poster)
				messages.ticking_message_read_poster.stop()
		}
		
		var typing = $('<div/>').addClass('typing')
		
		messages.typing_info = $('<div/>')
		typing.append(messages.typing_info)
		
		typing.insert_after(messages.options.container)
	}
	
	function new_message_channel(options)
	{
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
			var messages = this
			
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
	
	var who_is_typing = []
	
	var not_typing_timers = {}
	
	function get_typing_text(who_is_typing)
	{
		if (who_is_typing.пусто())
			return
		
		if (who_is_typing.length === 1)
			return who_is_typing.first() + ' пишет'
		
		var temporary = Array.clone(who_is_typing)
		var last = temporary.pop()
		return temporary.join(', ') + ' и ' + last + ' пишут'
	}
	
	function refresh_typing_text()
	{
		var text = get_typing_text(who_is_typing)
		
		if (text)
		{
			messages.typing_info.parent().fade_in(0.5)
			return messages.typing_info.text(text)
		}
		
		messages.typing_info.parent().fade_out(0.5)
	}
	
	messages.typing = function(имя)
	{
		if (!who_is_typing.has(имя))
			who_is_typing.add(имя)
		
		if (not_typing_timers[имя])
			clearTimeout(not_typing_timers[имя])
			
		not_typing_timers[имя] = (function()
		{
			who_is_typing.remove(имя)
			delete not_typing_timers[имя]
			refresh_typing_text()
		})
		.delay(1000)
		
		refresh_typing_text()
	}

	messages.внести_пользователя_в_список_вверху = function(user, options)
	{
		// не показывать там самого себя
		if (user._id === пользователь._id)
			return
		
		if (messages.who_is_connected_bar_list.find('> li[user="' + user._id + '"]').exists())
			return
	
		var container = $('<li user="' + user._id + '"></li>')
		container.addClass('online')
		
		var icon = $.tmpl('user icon', Object.x_over_y(user, { smaller: true, interactive: true }))
		
		if (user._id !== пользователь._id)
		{
			var link = $('<a/>').attr('href', '/люди/' + user.id)
			link.attr('title', user.имя).append(icon).appendTo(container)
		}
		else
		{
			icon.appendTo(container)
		}
		
		if (messages.who_is_connected_bar_list.is_empty())
			messages.who_is_connected_bar_list.parent().fade_in(Who_is_connected_bar_fade_in_duration)
		
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
			
			if (messages.who_is_connected_bar_list.is_empty())
				messages.who_is_connected_bar_list.parent().fade_out(Who_is_connected_bar_fade_out_duration)
		})
	}
	
	messages.enable_edit = function(path)
	{
		var can_show_earlier_messages = true
		var can_show_editor = true
	
		var own_messages
		
		function save_changes()
		{
			var edited_messages = []
			messages.options.container.find('>li[author="' + пользователь._id + '"]').each(function()
			{
				var message = $(this)
				message.find('.content').removeAttr('contenteditable')
				
				var new_content = message.find('.content').html()
				var _id = message.attr('message_id')
				
				if (own_messages[_id] && own_messages[_id] != new_content)
				{
					edited_messages.push({ _id: _id, content: new_content })
				}
			})
			
			var countdown = Countdown(edited_messages.length, function()
			{
				Режим.save_changes_to_server
				({
					continues: typeof options.save_changes !== 'undefined',
					
					anything_changed: function()
					{
						return !edited_messages.пусто()
					},
					
					data:
					{
						messages: JSON.stringify(edited_messages)
					},
					
					url: '/приложение/сеть/' + path + '/сообщения/правка',
					
					ok: options.save_changes
				})
			})
			
			edited_messages.for_each(function()
			{
				Wiki_processor.parse_and_validate(this.content, (function(content)
				{
				      this.content = content
				      countdown()
				})
				.bind(this))
			})
		}
		
		function discard_changes()
		{
			Object.for_each(own_messages, function(_id, content)
			{
				messages.options.container.find('>li[message_id="' + _id + '"] .content').html(content)
			})
		
			if (options.discard_changes)
				options.discard_changes()
			
			Режим.изменения_отменены()
		}
		
		function connected()
		{
			$(document).on_page('режим_изменения_сохранены', function()
			{
				can_show_editor = true
			
				if (messages.show_visual_editor_next_time)
					messages.show_editor()
			})
			
			$(document).on_page('режим_изменения_отменены', function()
			{
				can_show_editor = true
			
				if (messages.show_visual_editor_next_time)
					messages.show_editor()
			})
		
			Режим.при_переходе({ из: 'правка' }, function(options)
			{
				can_show_earlier_messages = true
				
				messages.options.container.find('>li[author="' + пользователь._id + '"]').find('.content').removeAttr('contenteditable')
			})
			
			Режим.при_переходе({ в: 'правка' }, function()
			{
				can_show_earlier_messages = false
				can_show_editor = false
				
				if (messages.visual_editor_was_shown)
					messages.show_visual_editor_next_time = true
				
				messages.hide_editor()
				
				own_messages = {}
				messages.options.container.find('>li[author="' + пользователь._id + '"]').each(function()
				{
					var message = $(this)
					message.find('.content').attr('contenteditable', true)
					own_messages[message.attr('message_id')] = message.find('.content').html()
				})
			})
			
			Режим.activate_edit_actions({ on_save: save_changes, on_discard: discard_changes })
			Режим.разрешить('правка')
		}
		
		this.options.connection.on_ready = connected
		
		messages.options.can_show_earlier_messages = function()
		{
			return can_show_earlier_messages
		}
		
		messages.options.can_show_editor = function()
		{
			return can_show_editor
		}
	}
	
	if (options.edit_path)
		messages.enable_edit(options.edit_path)
		
	new_message_channel(options.connection)

	return messages
}
