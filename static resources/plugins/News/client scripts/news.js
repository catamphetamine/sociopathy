(function()
{
	var news_indication
	
	В_эфире.add
	({
		id: 'новости',
		type: 'новости',
		action: function(data)
		{
			Новости.news['News'].new(data)
		}
	})
		
	News('News',
	{
		новости: [],
		
		reset: function()
		{
			this.новости = []
			
			news_indication.off()
		},
		
		new: function(data)
		{
			var indicate = false
			if (!this.anything_new())
				indicate = true
				
			this.новости.push(data._id)
			
			if (indicate)
			{
				news_indication.on()
			}
		},
		
		read: function(что)
		{
			if (!что.новость)
				return
			
			this.новости.remove(что.новость)
			if (this.новости.пусто())
				news_indication.off()
				
			return true
		},
		
		anything_new: function()
		{
			return !this.новости.пусто()
		},
		
		notifications: function(data)
		{
			if (data.новости && !data.новости.пусто())
			{
				Новости.новости(data.новости)
			}
		}
	})
	
	Inter_tab_communication.on('новости_прочитано', function(data)
	{
		if (data.что === 'новости')
			Новости.прочитано({ новость: data._id })
	})
	
	$(document).on('panel_loaded', function()
	{
		if (!пользователь)
			return
		
		news_indication = panel.toggle_buttons
		({
			type: 'News',
			fade_in_duration: 2,
			fade_out_duration: 3,
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
		
		tools.id = 'News'
	
		match_url(url,
		{
			'сеть/новости': function(rest)
			{
				tools.page('новости')
			}
		})
	})
})()