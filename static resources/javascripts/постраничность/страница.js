var Page = new Class
({
	Implements: [Options],

	data:
	{
		режим: {}
	},
	
	event_handlers: [],
	
	preload: function(callback) { callback() },
	load: $.noop,
	unload: $.noop,
	
	ajaxes: [],
	
	when_loaded_actions: [],
	when_unloaded_actions: [],
	
	ticking_actions: [],
	
	destroyables: [],
	
	по_нажатию_ids: [],
	
	void: false,
	
	queries: [],
	
	tracked: {},
	tracked_collectors: {},
	
	dialog_windows: [],
	context_menus: [],
	
	needs_to_load_content: true,
	
	when_loaded: function(action)
	{
		if (this.status === 'loaded')
			return action()
			
		this.when_loaded_actions.push(action)
	},
	
	when_unloaded: function(action)
	{
		this.when_unloaded_actions.push(action)
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
		 
		var page = this
		
		this.Ajax =
		{
			get: function(url, data, options)
			{
				var result = Ajax.get(url, data, options)
				page.ajaxes.push(result)
				return result
			},
			
			post: function(url, data, options)
			{
				var result = Ajax.post(url, data, options)
				page.ajaxes.push(result)
				return result
			},
			
			put: function(url, data, options)
			{
				var result = Ajax.put(url, data, options)
				page.ajaxes.push(result)
				return result
			},
			
			'delete': function(url, data, options)
			{
				var result = Ajax['delete'](url, data, options)
				page.ajaxes.push(result)
				return result
			}		
		}
		
		this.Available_actions = new Page_available_actions()
		this.Data_store = new Page_data_store(this)
	},
	
	refresh: function()
	{
		if (!next_page_data.scrolled_before_refresh)
			next_page_data.scrolled_before_refresh = прокрутчик.scrolled()

		navigate_to_page(Uri.parse().to_relative_url())
	},
	
	reload: function()
	{
		this.refresh()
	},
	
	hotkey: function(name, режим, action)
	{
		hotkey.bind(this)(name, режим, action)
	},
	
	content_ready: function()
	{
		// actions may need some extra info about the current page (e.g. is the user the author of the discussion, etc)
		if (пользователь)
			page.create_actions_list()
		
		if (page.data.scrolled_before_refresh)
		{
			прокрутчик.scroll_to(page.data.scrolled_before_refresh)
			delete page.data.scrolled_before_refresh
		}
		
		document.getElementById('previous_page').empty()
		
		$(document).trigger('page_content_ready')
	},
	
	full_load: function(возврат)
	{
		var page = this
		this.queries.for_each(function()
		{
			page[this.variable] = page.get(this.selector)
		})
		
		//this.ticking(update_intelligent_dates, 50) // testing
		this.ticking(update_intelligent_dates, 60 * 1000)

		this.queries.empty()
		
		if (page.data_loader)
			page.show_loaded_data()
		
		if (page.messages)
			page.show_messages()
		
		this.load()
		
		Режим.initialize_page()
		
		this.when_loaded_actions.forEach(function(action)
		{
			action()
		})
		
		this.when_loaded_actions.empty()
		
		this.status = 'loaded'
		
		возврат()
	},
	
	full_unload: function()
	{
		this.void = true
		
		if (this.Data_store.enabled)
			this.Data_store.destroy_mode({ navigating_away: true })
	
		Режим.сбросить()
	
		this.unload()
		
		if (this.messages)
			this.messages.unload()
		
		this.показывать_подсказки = false
	
		if (this.показанная_подсказка)
			Подсказки.закрыть(this.показанная_подсказка.id)
		
		this.event_handlers.for_each(function()
		{
			this.element.unbind(this.event)
			
			if (this.options.terminate)
				this.options.terminate()
		})
		
		this.ajaxes.for_each(function()
		{
			this.expire()
			this.abort()
		})
		
		this.destroyables.for_each(function()
		{
			this.destroy()
		})
		
		this.ticking_actions.for_each(function()
		{
			this.stop()
		})
		
		this.по_нажатию_ids.for_each(function()
		{
			Клавиши.убрать_по_нажатию(this)
		})
		
		Object.for_each(this.tracked, function(key, value)
		{
			if (!this.tracked_collectors[key])
			{
				console.log('* Uncollected tracked data: "' + key + '" = ' + value)
			}
			else
				this.tracked_collectors[key].bind(value)()
				
			delete this.tracked[key]
		})
		
		this.tracked = {}
		
		this.when_unloaded_actions.forEach(function(action)
		{
			action()
		})
		
		this.when_unloaded_actions.empty()
		
		this.Available_actions.destroy()
		
		this.dialog_windows.for_each(function()
		{
			this.destroy()
		})
		
		this.context_menus.for_each(function()
		{
			this.destroy()
		})
	
		//console.log('Unwatch elements on page unload')
		//console.log(this.watched_elements)
		
		var watched_element
		while (watched_element = this.watched_elements.shift())
		{
			page.unwatch(watched_element)
		}
		
		//console.log('Left watched elements:')
		//console.log(прокрутчик.elements.map(function(element) { return element.node() }))
	}
})