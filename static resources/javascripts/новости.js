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
		{
			console.log('something new @ ' + new Date())
			window_notification.something_new()
		}
		
		$('.news_indicating_stripe').fade_in({ maximum_opacity: 0.9 })
		
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
		
		this.ничего_нового()
	},
	
	ничего_нового: function()
	{
		$('.news_indicating_stripe').fade_out(0.3)
		
		console.log('nothing new @ ' + new Date())
		
		window_notification.nothing_new()
		this.есть_новости = false	
	},
	
	update_news_counter: function(news_logic)
	{
		if (!news_logic.news_count)
			return
	
		var Fade_in_duration = 0.2
		var Fade_out_duration = 0.4

		var Style_classes =
		[
			{ boundary: 100, style: 'three_digits' },
			{ boundary: 10, style: 'two_digits' },
			{ boundary: 0, style: 'one_digit' }
		]
			
		var news_count = news_logic.news_count()
	
		var counter = news_logic.panel_item().find('> .notification_counter')
		
		if (news_count <= 1)
			return counter.fade_out(Fade_out_duration)
	
		var found = false
		
		Style_classes.for_each(function()
		{
			if (!found && news_count >= this.boundary)
			{
				counter.addClass(this.style)
				found = true
			}
			else
			{
				counter.removeClass(this.style)
			}
		})
		
		counter.text(news_count)
		counter.fade_in(Fade_in_duration)
	},
	
	общение: function(options, последнее_сообщение)
	{
		if (!последнее_сообщение)
			return
		
		последнее_сообщение += ''
		
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
		
		var news_logic = this.news[options.communication_id]
		
		var indicate = false
		if (!news_logic.anything_new())
			indicate = true
		
		news_logic.new_message(options.общение, последнее_сообщение)

		this.update_news_counter(news_logic)
		
		if (indicate)
		{
			options.indication()
			
			if (!news_logic.not_important)
				this.появились_новости()			
		}
		
		if (show_bubble)
		{
			var text = Wiki_processor.simplify(options.text)
			
			text = text.just_one_line()
			
			Message.message('new_message_in_communication new_message_in_' + options.english, text,
			{
				postprocess: function(container)
				{
					this.attr('communication', options.общение)
					this.attr('message_id', последнее_сообщение)
					
					var text_container = $('<div/>').addClass('text')
					this.wrapInner(text_container)
					
					var avatar = $.render('user icon', Object.x_over_y({ smaller: true }, options.отправитель))
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
			{
				found = this.read(что)
					
				if (found)
					Новости.update_news_counter(this)
			}
		})
		
		// should we notify about news at all (tab icon, etc)
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
			this.ничего_нового()
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
			// close popup
			element.parent().parent().trigger('contextmenu')
		}
	})
}

function News(id, methods)
{
	Новости.news[id] = methods
}