(function()
{
	var news_indication

	function notification(_id, последнее_сообщение, options)
	{
		Новости.общение
		(Object.x_over_y(options,
		{
			page: 'Talks/беседа',
			url: 'сеть/беседы',
			общение: _id,
			indication: news_indication.on,
			communication_id: 'Talks'
		}),
		последнее_сообщение)
	}
	
	Page_icon({ page: 'общение', when: function(page) { return page.data.общение === 'беседа' }, icon: 'Talks' })
			
	function убрать_уведомления_о_сообщениях(общение, последнее_прочитанное)
	{
		close_popup('talk', общение, последнее_прочитанное, { including_before: true })
	}

	Inter_tab_communication.on('убрать_уведомление', function(data)
	{
		if (data.what === 'Talks')
			убрать_уведомления_о_сообщениях(data.общение, data.сообщение)
	})

	$(document).on('panel_loaded', function()
	{
		if (!пользователь)
			return
		
		news_indication = panel.toggle_buttons
		({
			type: 'Talks',
			fade_in_duration: 1,
			fade_out_duration: 1.5,
			show:
			{
				button: { new: true }
			},
			initialize: true
		})
	})
	
	В_эфире.add
	({
		id: 'новости',
		type: 'беседа',
		action: function(data)
		{
			notification(data._id, data.сообщение, { id: data.id, отправитель: data.отправитель, text: data.text })
		}
	})
	
	В_эфире.add
	({
		id: 'новости',
		type: 'беседа.добавление',
		action: function(data)
		{
			info('Вас добавили в беседу <a href=\'/сеть/беседы/' + data.id + '\'>«' + data.название + '»</a>')
		}
	})
	
	В_эфире.add
	({
		id: 'беседа',
		type: 'переназвано',
		action: function(data)
		{
			$(document).trigger('talk_renamed', data)
		}
	})
	
	В_эфире.add
	({
		id: 'сообщения',
		type: 'правка',
		action: function(data)
		{
			if (data.чего !== 'беседа')
				return
	
			var talk = $('#talk[_id="' + data.чего_id + '"]')
			if (!talk.exists())
				return

			var message = talk.find('> [message_id="' + data._id + '"]')
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
	
	Inter_tab_communication.on('новости_прочитано', function(data)
	{
		if (data.что === 'беседа')
			Новости.прочитано({ беседа: data.сообщения_чего, сообщение: data._id })
	})
	
	News('Talks',
	{
		беседы: {},
		
		reset: function()
		{
			this.беседы = {}
		},
		
		new_message: function(communication, new_message)
		{
			this.беседы[communication] = new_message
		},
	 
		read: function(что)
		{
			if (!что.беседа)
				return
		
			убрать_уведомления_о_сообщениях(что.беседа, что.сообщение)
			
			$(document).trigger('message_read', что)
			
			if (this.беседы[что.беседа] === что.сообщение)
			{
				delete this.беседы[что.беседа]
				news_indication.off()
			}
			
			return true
		},
		
		anything_new: function()
		{
			return !Object.пусто(this.беседы)
		},
		
		notifications: function(data)
		{
			if (!data.беседы)
				return
			
			Object.for_each(data.беседы, function(_id)
			{
				notification(_id, this)
			})
		}
	})
	
	url_matcher(function(url)
	{
		var tools = this
		
		tools.id = 'Talks'
	
		match_url(url,
		{
			'сеть/беседы': function(rest)
			{
				if (!rest)
					return tools.page('беседы')
			
				match_url(rest,
				{
					'*': function(value, rest)
					{
						page.data.общение = { id: value }
						tools.page('беседа')
					}
				})
			}
		})
	})
})()