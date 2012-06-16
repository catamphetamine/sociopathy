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
						
						new_page.data.пользователь_сети = { 'адресное имя': value }
						
						match_url(rest,
						{
							'дневник': function(rest)
							{
								название_страницы = 'человек/дневник'
								
								match_url(rest,
								{
									'*': function(value, rest)
									{
										название_страницы = 'человек/запись в дневнике'
										new_page.data.запись = value
									}
								})
							},
							'журнал': function(rest)
							{
								название_страницы = 'человек/журнал'
								
								match_url(rest,
								{
									'*': function(value, rest)
									{
										название_страницы = 'человек/запись в журнале'
										new_page.data.запись = value
									}
								})
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
										new_page.data.картинка = rest
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
										new_page.data.видеозапись = rest
									}
								})
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
			'сеть/беседы': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						название_страницы = 'сеть/беседа'
						new_page.data.беседа = { id: value }
					}
				})
			},
			'сеть/обсуждения': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						название_страницы = 'сеть/обсуждение'
						new_page.data.обсуждение = { id: value }
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
	
	ticking_actions: [],
	
	void: false,
	
	queries: [],
	
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
	
	get: function(selector)
	{
		return this.content.find(selector)
	},
	
	query: function(selector, variable)
	{
		this.queries.push({ variable: variable, selector: selector })
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
		this.void = true
		
		Режим.сбросить()
	
		this.unload()
		
		this.event_handlers.for_each(function()
		{
			this.element.unbind(this.event)
		})
		
		this.ajaxes.for_each(function()
		{
			this.expire()
		})
		
		this.ticking_actions.for_each(function()
		{
			this.stop()
		})
	},
	
	on: function(element, event, action)
	{
		if (!event.contains('.'))
			throw 'You must specify a namespace for page event: ' + event
			
		this.event_handlers.push({ element: element, event: event })
		element.on(event, action)
	},
	
	ticking: function(action, interval)
	{
		this.ticking_actions.push(action.ticking(interval))
	}
})