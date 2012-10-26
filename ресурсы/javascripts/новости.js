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
	
	звуки:
	{
		беседы: new Audio("/звуки/пук.ogg"),
		обсуждения: new Audio("/звуки/пук.ogg")
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
		что_нового =
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
		
		if (Страница.эта() === options.url)
		{
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
			
			if (options.important)
				this.появились_новости()
		}
	},
	
	болталка: function(последнее_сообщение)
	{
		this.общение
		({
			url: 'сеть/болталка',
			path: 'болталка'
			indication: panel.new_chat_messages,
			important: false
		},
		последнее_сообщение)
	},
    
	обсуждение: function(обсуждение, последнее_сообщение)
	{
		this.общение
		({
			url: 'сеть/обсуждение',
			path: 'обсуждения.' + обсуждение
			indication: panel.new_discussion_messages
		},
		последнее_сообщение)
	},
    
	беседа: function(беседа, последнее_сообщение)
	{
		this.общение
		({
			url: 'сеть/беседа',
			path: 'беседы.' + беседа
			indication: panel.new_talk_messages
		},
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