(function()
{
	var news_indication
		
	function notification(последнее_сообщение)
	{
		Новости.общение
		({
			page: 'Chat/болталка',
			indication: news_indication.on,
			communication_id: 'Chat'
		},
		последнее_сообщение)
	}
	
	В_эфире.add
	({
		id: 'новости',
		type: 'болталка',
		action: function(data)
		{
			notification(data.сообщение)
		}
	})

	В_эфире.add
	({
		id: 'сообщения',
		type: 'правка',
		action: function(data)
		{
			if (data.чего !== 'болталка')
				return
	
			var message = $('#chat > [message_id="' + data._id + '"]')
			if (!message.exists())
				return

			if (!message.hasClass('new'))
			{
				message.addClass('new');
				(function() { message.removeClass('new') }).delay(500)
			}
			
			message.find('.content').html(Wiki_processor.decorate(data.сообщение))
			
			postprocess_rich_content(message)
		}
	})

	В_эфире.add
	({
		id: 'новости',
		type: 'прочитано',
		action: function(data)
		{
			if (data.что === 'болталка')
				Новости.прочитано({ болталка: data._id })
		}
	})
	
	Inter_tab_communication.on('новости_прочитано', function(data)
	{
		if (data.что === 'болталка')
			Новости.прочитано({ болталка: data._id })
	})
	
	News('Chat',
	{
		latest_unread_message: null,
		
		not_important: true,
		
		reset: function()
		{
			this.latest_unread_message = null
			
			news_indication.off()
		},
		
		new_message: function(communication, new_message)
		{
			this.latest_unread_message = new_message
		},
		
		read: function(что)
		{
			if (!что.болталка)
				return
		
			$(document).trigger('message_read', что)
			
			if (this.latest_unread_message)
			{
				if (this.latest_unread_message <= что.болталка)
				{
					this.latest_unread_message = null
					news_indication.off()
				}
			}
			
			return true
		},
		
		anything_new: function()
		{
			this.latest_unread_message !== null
		},
		
		notifications: function(data)
		{
			if (data.болталка)
			{
				notification(data.болталка)
			}
		}
	})
	
	$(document).on('panel_loaded', function()
	{
		if (!пользователь)
			return

		news_indication = panel.toggle_buttons
		({
			type: 'Chat',
			fade_in_duration: 1,
			fade_out_duration: 1.5,
			show:
			{
				button: { new: true }
			},
			initialize: true
		})
	})
	
	url_matcher(function(url)
	{
		var tools = this
		
		tools.id = 'Chat'
		
		tools.match(url,
		{
			'url.network': function(rest)
			{
				tools.match(rest,
				{
					'pages.chat.url section': function(rest)
					{
						tools.page('болталка')
					}
				})
			}
		})
	})
})()