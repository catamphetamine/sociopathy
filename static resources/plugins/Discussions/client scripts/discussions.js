(function()
{
	Url_map['discussions'] = text('url.network') + '/' + text('pages.discussions.url section')
	Url_map['discussion'] = function(id) { return link_to('discussions') + '/' + id }
	
	Communication_type('discussions', { 'new communication type': 'обсуждение' })
	
	var news_indication

	function notification(_id, последнее_сообщение, options)
	{
		Новости.общение
		(Object.x_over_y(options,
		{
			page: 'Discussions/обсуждение',
			url: 'сеть/обсуждения',
			общение: _id,
			indication: news_indication.on,
			communication_id: 'Discussions'
		}),
		последнее_сообщение)
	}
	
	function убрать_уведомления_о_сообщениях(общение, последнее_прочитанное)
	{
		close_popup('discussion', общение, последнее_прочитанное, { including_before: true })
	}

	Inter_tab_communication.on('убрать_уведомление', function(data)
	{
		if (data.what === 'Discussion')
			убрать_уведомления_о_сообщениях(data.общение, data.сообщение)
	})
	
	Page_icon({ page: 'общение', when: function() { return page_data('общение') === 'обсуждение' }, icon: 'Discussions' })
	
	В_эфире.add
	({
		id: 'новости',
		type: 'обсуждение',
		action: function(data)
		{
			notification(data._id, data.сообщение, { id: data.id, отправитель: data.отправитель, text: data.text })
		}
	})
	
	В_эфире.add
	({
		id: 'обсуждение',
		type: 'переназвано',
		action: function(data)
		{
			$(document).trigger('discussion_renamed', data)
		}
	})
	
	В_эфире.add
	({
		id: 'сообщения',
		type: 'правка',
		action: function(data)
		{
			if (data.чего !==  'обсуждение')
				return
			
			var discussion = $('#discussion[_id="' + data.чего_id + '"]')
			if (!discussion.exists())
				return
		
			var message = discussion.find('> [message_id="' + data._id + '"]')
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
			if (data.что === 'обсуждение')
				Новости.прочитано({ обсуждение: data.сообщения_чего, сообщение: data._id })
		}
	})
	
	Inter_tab_communication.on('новости_прочитано', function(data)
	{
		if (data.что === 'обсуждение')
			Новости.прочитано({ обсуждение: data.сообщения_чего, сообщение: data._id })
	})
	
	$(document).on('panel_loaded', function()
	{
		if (!пользователь)
			return
	
		news_indication = panel.toggle_buttons
		({
			type: 'Discussions',
			fade_in_duration: 1,
			fade_out_duration: 1.5,
			show:
			{
				button: { new: true }
			},
			initialize: true
		})
	})
	
	News('Discussions',
	{
		обсуждения: {},
		
		reset: function()
		{
			this.обсуждения = {}
			news_indication.off()
		},
		
		new_message: function(communication, new_message)
		{
			this.обсуждения[communication] = new_message
		},
		
		звуковое_оповещение: function(чего)
		{
			if (чего === 'обсуждение')
				new Audio("/звуки/пук.ogg").play()
		},
		
		read: function(что)
		{
			if (!что.обсуждение)
				return
		
			убрать_уведомления_о_сообщениях(что.обсуждение, что.сообщение)
			
			$(document).trigger('message_read', что)
		
			if (this.обсуждения[что.обсуждение] === что.сообщение)
			{
				delete this.обсуждения[что.обсуждение]
				news_indication.off()
			}
			
			return true
		},
		
		anything_new: function()
		{
			return !Object.пусто(this.обсуждения)
		},
		
		notifications: function(data)
		{
			if (!data.обсуждения)
				return
		
			Object.for_each(data.обсуждения, function(_id)
			{
				notification(_id, this)
			})
		}
	})
	
	url_matcher(function(url)
	{
		var tools = this
		
		tools.id = 'Discussions'
	
		tools.match(url,
		{
			'url.network': function(rest)
			{
				tools.match(rest,
				{
					'pages.discussions.url section': function(rest)
					{
						if (!rest)
							return tools.page('обсуждения')
					
						tools.match(rest,
						{
							'*': function(value, rest)
							{
								page_data('общение', { id: value })
								tools.page('обсуждение')
							}
						})
					}
				})
			}
		})
	})
})()
