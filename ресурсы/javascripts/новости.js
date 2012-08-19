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
	
	болталка: function(новое_сообщение)
	{
		if (Страница.эта() === 'сеть/болталка')
		{
			var message = page.get('#chat > li[message_id="' + новое_сообщение + '"]')
			if (message.exists() && !message.hasClass('new'))
				return //alert('not new')
		}
		
		var indicate = false
		if (!this.что_нового.болталка)
			indicate = true
			
		this.что_нового.болталка = новое_сообщение
		
		if (indicate)
		{
			panel.new_chat_messages()
		}
			
		//panel.new_chat_messages({ immediate: true })
	},
    
	обсуждение: function(обсуждение, новые_сообщения)
	{
		if (Страница.эта() === 'сеть/обсуждения')
		{
			var discussion = page.get('#discussions > li[_id="' + обсуждение + '"]')
				
			if (discussion.exists())
				discussion.addClass('new')
		}
		if (Страница.эта() === 'сеть/обсуждение')
		{
			var сообщения = Array.clone(новые_сообщения)
			новые_сообщения = []
			
			сообщения.for_each(function()
			{
				var message = page.get('#discussion > li[message_id="' + this + '"]')
				
				if (message.exists() && !message.hasClass('new'))
					return //alert('not new')
				
				новые_сообщения.push(this)
			})
		}
		
		if (!(новые_сообщения instanceof Array))
			новые_сообщения = [новые_сообщения]
			
		if (!this.что_нового.обсуждения[обсуждение])
			this.что_нового.обсуждения[обсуждение] = []
			
		var indicate = false
		if (this.что_нового.обсуждения[обсуждение].пусто())
			indicate = true
			
		this.что_нового.обсуждения[обсуждение].combine(новые_сообщения)
		
		if (indicate)
		{
			panel.new_discussion_messages()
			
			this.появились_новости()
		}
	},
    
	беседа: function(беседа, новые_сообщения)
	{
		if (Страница.эта() === 'сеть/беседы')
		{
			var talk = page.get('#talks > li[_id="' + беседа + '"]')
				
			if (talk.exists())
				talk.addClass('new')
		}
		else if (Страница.эта() === 'сеть/беседа')
		{
			var сообщения = Array.clone(новые_сообщения)
			новые_сообщения = []
			
			сообщения.for_each(function()
			{
				var message = page.get('#talk > li[message_id="' + this + '"]')
				
				if (message.exists() && !message.hasClass('new'))
					return //alert('not new')
				
				новые_сообщения.push(this)
			})
		}
		
		if (!(новые_сообщения instanceof Array))
			новые_сообщения = [новые_сообщения]
			
		if (!this.что_нового.беседы[беседа])
			this.что_нового.беседы[беседа] = []
			
		var indicate = false
		if (this.что_нового.беседы[беседа].пусто())
			indicate = true
			
		this.что_нового.беседы[беседа].combine(новые_сообщения)
		
		if (indicate)
		{
			panel.new_talk_messages()
			
			this.появились_новости()
		}
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
			if (!this.что_нового.обсуждения[что.обсуждение])
				return
			
			this.что_нового.обсуждения[что.обсуждение].remove(что.сообщение)
			if (this.что_нового.обсуждения[что.обсуждение].пусто())
			{
				delete this.что_нового.обсуждения[что.обсуждение]
				panel.no_more_new_discussion_messages()
				
				if (Страница.эта() === 'сеть/обсуждения')
				{
					var discussion = page.get('#discussions > li[_id="' + что.обсуждение + '"]')
						
					if (discussion.exists())
						discussion.removeClass('new')
				}
			}
		}
		else if (что.беседа)
		{
			if (!this.что_нового.беседы[что.беседа])
				return
			
			this.что_нового.беседы[что.беседа].remove(что.сообщение)
			
			if (this.что_нового.беседы[что.беседа].пусто())
			{
				delete this.что_нового.беседы[что.беседа]
				panel.no_more_new_talk_messages()
					
				if (Страница.эта() === 'сеть/беседы')
				{
					var talk = page.get('#talks > li[_id="' + что.беседа + '"]')
						
					if (talk.exists())
						talk.removeClass('new')
				}
			}
		}
		else if (что.болталка)
		{
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
			/*
			if (this.задержанное_уведомление_о_новостях)
			{
				clearTimeout(this.задержанное_уведомление_о_новостях)
				this.задержанное_уведомление_о_новостях = null
			}
			*/
			
			window_notification.nothing_new()
			this.есть_новости = false
		}
	}
}))()