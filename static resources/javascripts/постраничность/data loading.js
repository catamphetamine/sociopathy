Page.implement
({
	load_data_either_way: function(options)
	{
		options.show = false
		
		this.load_data(page.either_way_loading(options))
	},
	
	load_data: function(data_loader)
	{
		// assume it's gonna be a Scroll_loader
		if (data_loader.url)
		{
			data_loader.hidden = true
			data_loader = new Scroll_loader(data_loader)
		}
		
		page.data_loader = data_loader
		
		if (data_loader.options.done === $.noop)
			data_loader.options.done = function() { page.content_ready() }
			
		if (data_loader.options.before_done_more === $.noop)
			data_loader.options.before_done_more = function() { ajaxify_internal_links(page[page.data_container]) }
		
		page.preload = function(finish)
		{
			data_loader.preload(finish)
		}
		
		page.before_output_data = function(action)
		{
			data_loader.options.before_done = action
		}
	},
	
	load_messages: function(options)
	{
		page.messages = Interactive_messages(options)
			
		page.preload = function(finished)
		{
			page.messages.preload(finished)
		}
	},
	
	either_way_loading: function(options)
	{
		var loader = new Either_way_loading(options)
		this.destroyables.push(loader)
		return loader
	},
	
	show_messages: function()
	{
		page.messages.options.container = page[page.messages_container]
		page.messages.loader.options.container = page.messages.options.container
		page.messages.start()
	},
	
	show_loaded_data: function()
	{
		if (instanceOf(page.data_loader, Either_way_loading))
		{
			page.data_loader.options.container = page[page.data_container]
			return page.data_loader.show()
		}
		
		if (instanceOf(page.data_loader, Scroll_loader))
		{
			page.data_loader.initialize_scrolling()
		}

		var options
		
		if (page.data_templater_options)
		{
			if (typeof page.data_templater_options === 'function')
				options = page.data_templater_options()
			else
				options = page.data_templater_options
		}
		else
		{
			options =
			{
				template: page.data_template,
				to: page[page.data_container],
				loader: page.data_loader
			}
		}
		
		new Data_templater(options, page.data_loader).show()
	}
})