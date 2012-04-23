var Страница =
{
	определить: function(url, new_page, proceed)
	{
		var название_страницы = путь_страницы(url)
			
		if (!название_страницы)
			название_страницы = 'обложка'
		
		match_url(название_страницы,
		{
			'люди': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						var int_value = parseInt(value)
						if (int_value == value && int_value > 0)
						{
							new_page.data.номер_страницы = int_value
							название_страницы = 'люди'
							return
						}
						
						new_page.data.адресное_имя = value
						название_страницы = 'человек/человек'
						
						match_url(rest,
						{
							'дневник': function(rest)
							{
								название_страницы = 'человек/дневник'
							},
							'книги': function()
							{
								название_страницы = 'человек/книги'
							},
							'картинки': function(rest)
							{
								название_страницы = 'человек/картинки'
								
								match_url(rest,
								{
									'*': function(value, rest)
									{
										название_страницы = 'человек/альбом с картинками'
										new_page.data.альбом = value
									}
								})
							},
							'видео': function(rest)
							{
								название_страницы = 'человек/видео'
								
								match_url(rest,
								{
									'*': function(value, rest)
									{
										название_страницы = 'человек/альбом с видео'
										new_page.data.альбом = value
									}
								})
							},
							'общие друзья': function()
							{
								название_страницы = 'общие друзья'
							}
						})
					}
				})
			},
			'читальня': function(rest)
			{
				match_url(rest,
				{
					'*': function()
					{
						var путь = название_страницы.substring('читальня/'.length)
						new_page.data.путь = путь
						раздел_или_заметка(путь, proceed)
						new_page.data.breaks_from_normal_workflow = true
					}
				})
			}
		})
		
		this.эта(название_страницы)
	},

	переход: function()
	{
		this.страница = null
	},
			
	эта: function()
	{
		if (arguments.length === 0)
			return this.страница
		
		var страница = arguments[arguments.length - 1]
		var путь = arguments[0]
		
		//if (!путь)
		//	путь = страница
			
		this.страница = страница
		this.путь = путь
	},
	
	is: function(страница)
	{
		return this.страница === страница
	},
	
	matches: function(pattern)
	{
		return this.страница.matches(pattern)
	}
}

var Page = new Class
({
	Implements: [Options],

	data: {},
	
	event_handlers: [],
	
	load: $.noop,
	unload: $.noop,
	
	ajaxes: [],
	
	when_loaded_actions: [],
	
	when_loaded: function(action)
	{
		if (this.status === 'loaded')
			return action()
			
		this.when_loaded_actions.push(action)
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
	},
	
	full_load: function()
	{
		this.load()
		
		this.when_loaded_actions.forEach(function(action)
		{
			action()
		})
		
		this.when_loaded_actions.empty()
		
		this.status = 'loaded'
	},
	
	full_unload: function()
	{
		Режим.сбросить()
	
		this.unload()
		
		this.event_handlers.forEach(function(handler)
		{
			handler.element.unbind(handler.event)
		})
		
		this.ajaxes.forEach(function(ajax)
		{
			ajax.expire()
		})
	},
	
	on: function(element, event, action)
	{
		if (!event.contains('.'))
			throw 'You must specify a namespace for page event: ' + event
			
		this.event_handlers.push({ element: element, event: event })
		element.on(event, action)
	}
})