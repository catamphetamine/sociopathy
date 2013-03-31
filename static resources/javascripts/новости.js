var Новости = new (new Class
({
	//задержка_уведомления_о_новостях: 3000,
	
	news: {},
	
	initialize: function()
	{
	},
	
	появились_новости: function()
	{
		if (!this.есть_новости)
			window_notification.something_new()
		
		this.есть_новости = true
	},
	
	звуковое_оповещение: function(чего)
	{
		Object.for_each(this.news, function()
		{
			if (this.звуковое_оповещение)
				this.звуковое_оповещение(чего)
		})
	},
	
	сброс: function()
	{
		Object.for_each(this.news, function()
		{
			this.reset()
		})
		
		window_notification.nothing_new()
		this.есть_новости = false
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
		if (!this.news[options.communication_id].anything_new())
			indicate = true
			
		this.news[options.communication_id].new_message(options.общение, последнее_сообщение)
			
		if (indicate)
		{
			options.indication()
			
			if (!this.news[options.communication_id].not_important)
				this.появились_новости()			
		}
		
		if (show_bubble)
		{
			var text = Wiki_processor.simplify(options.text)
			
			Message.message('new_message_in_communication new_message_in_' + options.english, text,
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
					Inter_tab_communication.send('убрать_уведомление',
					{
						what: options.id,
						общение: this.attr('communication'),
						сообщение: this.attr('message_id')
					})
				}
			})
		}
	},
    
	прочитано: function(что)
	{
		var found = false
		Object.for_each(this.news, function()
		{
			if (!found)
				found = this.read(что)
		})
		
		// should we notify about news
		var anything_new = false
		Object.for_each(this.news, function()
		{
			if (anything_new)
				return
			
			if (this.not_important)
				return
			
			anything_new = this.anything_new()
		})
		
		if (!anything_new)
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

function News(id, methods)
{
	Новости.news[id] = methods
}