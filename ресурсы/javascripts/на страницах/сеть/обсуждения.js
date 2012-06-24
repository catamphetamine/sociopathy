title('Обсуждения');
	
(function()
{	
	page.query('#discussions', 'discussions')
	
	page.load = function()
	{
		Подсказки.подсказка('Здесь вы можете обсуждать что-нибудь с другими членами сети.')

		breadcrumbs
		([
			{ title: 'Обсуждения', link: '/сеть/обсуждение' }
		])
		
		new Data_templater
		({
			template: 'обсуждение в списке обсуждений',
			to: page.discussions,
			loader: new  Batch_data_loader_with_infinite_scroll
			({
				url: '/приложение/сеть/обсуждения',
				batch_size: 10,
				scroll_detector: page.get('#scroll_detector'),
				before_done: discussions_loaded,
				before_done_more: function() { ajaxify_internal_links(page.discussions) },
				data: function(data)
				{
					parse_dates(data.обсуждения, 'создано')
					return data.обсуждения
				}
			})
		})
	}
	
	page.load = function()
	{
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
			show_editor: true,
			on_load: chat_loaded
		})
	}
	
	function discussions_loaded()
	{
		$(document).trigger('page_initialized')
		
		if (page.discussions.is_empty())
		{
			page.discussions.remove()
			page.get('.main_content').find('> .empty').show()
		}
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()