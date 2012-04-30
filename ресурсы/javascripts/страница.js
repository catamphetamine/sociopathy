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
							'журнал': function(rest)
							{
								название_страницы = 'человек/журнал'
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
						},
						{
							no_match: function()
							{
								название_страницы = 'страница не найдена'
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
		
		this.Data_store =
		{
			populate: $.noop,
			collect: $.noop,
			load: function(возврат)
			{
				var data_store = this
				
				this.load_draft(function(черновик)
				{
					if (черновик)
						return возврат(черновик)
						
					return возврат(data_store.deduce())
				})
			},
			deduce: function()
			{
				return {}
			},
			load_draft: function(возврат)
			{
				var data_store = this
				
				page.Ajax.get('/приложение/сеть/черновик', { что: data_store.что })
				.ok(function(data)
				{
					возврат(data.черновик)
				})
				.ошибка(function()
				{
					error('Не удалось проверить черновик')
					возврат()
				})
			}
		}
	},
	
	full_load: function(возврат)
	{
		this.load()
		
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
		Режим.сбросить()
	
		this.unload()
		
		this.event_handlers.forEach(function(handler)
		{
			console.log(handler.event)
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