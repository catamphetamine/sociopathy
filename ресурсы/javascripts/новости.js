var Новости = new (new Class
({
	//задержка_уведомления_о_новостях: 3000,
	
	что_нового:
	{
		новости: [],
		беседы: {},
		обсуждения: {},
		болталка: []
	},
	
	звуки:
	{
		беседы: new Audio("/звуки/звонок.ogg"),
		обсуждения: new Audio("/звуки/звонок.ogg")
	},
	
	появились_новости: function()
	{
		//if (!this.есть_новости)
		//	this.задержанное_уведомление_о_новостях = site_icon.something_new.delay(this.задержка_уведомления_о_новостях)
		
		if (!this.есть_новости)
			site_icon.something_new()
		
		this.есть_новости = true
	},
	
	звуковое_оповещение: function(чего)
	{
		if (!this.звуки[чего])
			return //throw 'Sound not found for ' + чего
		
		this.звуки[чего].play()
	},
    
	болталка: function(новое_сообщение)
	{
		var indicate = false
		if (this.что_нового.болталка.пусто())
			indicate = true
			
		this.что_нового.болталка.push(новое_сообщение)
		
		if (indicate)
		{
			panel.new_chat_messages()
		}
			
		//panel.new_chat_messages({ immediate: true })
	},
    
	обсуждение: function(обсуждение, новые_сообщения)
	{
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
			}
		}
		else if (что.болталка)
		{
			this.что_нового.болталка.remove(что.болталка)
			if (this.что_нового.болталка.пусто())
				panel.no_more_new_chat_messages()
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
			
			site_icon.nothing_new()
			this.есть_новости = false
		}
	}
}))()