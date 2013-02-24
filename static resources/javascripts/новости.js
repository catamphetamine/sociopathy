var Новости = new (new Class
({
	//задержка_уведомления_о_новостях: 3000,
	
	что_нового:
	{
		новости: [],
		беседы: {},
		обсуждения: {},
		болталка: null
	},
	
	// если не открыто окно обсуждения
	звуки:
	{
		беседы: new Audio("/звуки/пук.ogg"),
		обсуждения: new Audio("/звуки/пук.ogg")
	},
	
	initialize: function()
	{
	},
	
	появились_новости: function()
	{
		//if (!this.есть_новости)
		//	this.задержанное_уведомление_о_новостях = site_icon.something_new.delay(this.задержка_уведомления_о_новостях)
		
		if (!this.есть_новости)
			window_notification.something_new()
		
		this.есть_новости = true
	},
	
	звуковое_оповещение: function(чего)
	{
		if (!this.звуки[чего])
			return //throw 'Sound not found for ' + чего
		
		this.звуки[чего].play()
	},
	
	сброс: function()
	{
		this.что_нового =
		{
			новости: [],
			беседы: {},
			обсуждения: {},
			болталка: null
		}
		
		window_notification.nothing_new()
		this.есть_новости = false
		
		panel.no_more_new_chat_messages()
	},
	
	общение: function(options, последнее_сообщение)
	{
		if (!последнее_сообщение)
			return
		
		последнее_сообщение = последнее_сообщение + ''
		
		var show_bubble = false
		
		if (options.important !== false)
		{
			if (options.text)
			{
				show_bubble = true
			}
		}
		
		if (Страница.эта() === options.page)
		{
			// если уже загружена первая партия сообщений,
			// то получен _id общения: page.data.общение._id
			if (options.общение && page.data.общение._id)
			{
				if (page.data.общение._id === options.общение)
				{
					show_bubble = false
				}
			}
			else
				show_bubble = false
			
			var message = page.get('.author_content_date > li[message_id="' + последнее_сообщение + '"]')
			
			if (message.exists() && !message.hasClass('new'))
				return
		}
			
		var indicate = false
		if (!Object.path(this.что_нового, options.path))
			indicate = true
			
		Object.set(this.что_нового, options.path, последнее_сообщение)
			
		if (indicate)
		{
			options.indication()
			
			if (options.important !== false)
				this.появились_новости()			
		}
		
		if (show_bubble)
		{
			var text = Wiki_processor.simplify(options.text)
			
			Message.message('new_message_in_' + options.english, text,
			{
				postprocess: function(container)
				{
					this.attr('communication', options.общение)
					this.attr('message_id', последнее_сообщение)
					
					var text_container = $('<div/>').addClass('text')
					this.wrapInner(text_container)
					
					var avatar = $.tmpl('маленький аватар', Object.x_over_y(options.отправитель, { no_link: true }))
					avatar.prependTo(this)
				},
				ссылка: '/' + options.url + '/' + options.id,
				время: 1.5,
				on_close: function()
				{
					/*
					switch (options.english)
					{
						case 'talk':
							data.что = 'беседа'
							break
						
						case 'discussion':
							data.что = 'обсуждение'
							break
					}
					*/
					
					Inter_tab_communication.send('убрать_уведомление',
					{
						what: options.english,
						общение: this.attr('communication'),
						сообщение: this.attr('message_id')
					})
				}
			})
		}
	},
	
	болталка: function(последнее_сообщение)
	{
		this.общение
		({
			page: 'сеть/болталка',
			path: 'болталка',
			indication: panel.new_chat_messages,
			important: false
		},
		последнее_сообщение)
	},
    
	обсуждение: function(обсуждение, последнее_сообщение, options)
	{
		this.общение
		(Object.x_over_y(options,
		{
			page: 'сеть/обсуждение',
			url: 'сеть/обсуждения',
			общение: обсуждение,
			path: 'обсуждения.' + обсуждение,
			indication: panel.new_discussion_messages,
			english: 'discussion'
		}),
		последнее_сообщение)
	},
    
	беседа: function(беседа, последнее_сообщение, options)
	{
		this.общение
		(Object.x_over_y(options,
		{
			page: 'сеть/беседа',
			url: 'сеть/беседы',
			общение: беседа,
			path: 'беседы.' + беседа,
			indication: panel.new_talk_messages,
			english: 'talk'
		}),
		последнее_сообщение)
	},
    
	новости: function(новости)
	{
		var indicate = false
		if (this.что_нового.новости.пусто())
			indicate = true
			
		this.что_нового.новости.combine(новости)
		
		if (indicate)
		{
			panel.new_news()
			
			//this.появились_новости()
		}
	},
	
	прочитано: function(что)
	{
		if (что.новость)
		{	
			this.что_нового.новости.remove(что.новость)
			if (this.что_нового.новости.пусто())
				panel.no_more_new_news()
		}
		else if (что.обсуждение)
		{
			убрать_уведомления_сообщениях('обсуждение', что.обсуждение, что.сообщение)
			
			$(document).trigger('message_read', что)
		
			if (!this.что_нового.обсуждения[что.обсуждение])
				return
			
			if (this.что_нового.обсуждения[что.обсуждение] === что.сообщение)
			{
				delete this.что_нового.обсуждения[что.обсуждение]
				panel.no_more_new_discussion_messages()
			}
		}
		else if (что.беседа)
		{
			убрать_уведомления_сообщениях('беседа', что.беседа, что.сообщение)
			
			$(document).trigger('message_read', что)
			
			if (!this.что_нового.беседы[что.беседа])
				return
			
			if (this.что_нового.беседы[что.беседа] === что.сообщение)
			{
				delete this.что_нового.беседы[что.беседа]
				panel.no_more_new_talk_messages()
			}
		}
		else if (что.болталка)
		{
			$(document).trigger('message_read', что)
			
			if (this.что_нового.болталка)
				if (this.что_нового.болталка <= что.болталка)
				{
					this.что_нового.болталка = null
					panel.no_more_new_chat_messages()
				}
		}
		
		if (this.что_нового.новости.пусто()
			&& Object.пусто(this.что_нового.обсуждения)
			&& Object.пусто(this.что_нового.беседы))
		{	
			window_notification.nothing_new()
			this.есть_новости = false
		}
	}
}))()

function close_popup(where, общение, последнее_прочитанное, options)
{
	options = options || {}
	
	$('.new_message_in_' + where + ' .popup_panel[communication="' + общение + '"]').each(function()
	{
		var element = $(this)
		
		var close
		
		if (options.including_before)
		{
			if (element.attr('message_id') <= последнее_прочитанное)
				close = true
		}
		else
		{
			if (element.attr('message_id') === последнее_прочитанное)
				close = true
		}
		
		if (close)
		{
			element.parent().parent().trigger('contextmenu')
		}
	})
}

function убрать_уведомления_сообщениях(чего, общение, последнее_прочитанное)
{
	switch (чего)
	{
		case 'беседа':
			close_popup('talk', общение, последнее_прочитанное, { including_before: true })
			break
		
		case 'обсуждение':
			close_popup('discussion', общение, последнее_прочитанное, { including_before: true })
			break
	}
}

Inter_tab_communication.on('убрать_уведомление', function(data)
{
	switch (data.what)
	{
		case 'talk':
			что = 'беседа'
			break
		
		case 'discussion':
			что = 'обсуждение'
			break
	}
	
	убрать_уведомления_сообщениях(что, data.общение, data.сообщение)
})