var url_matchers = []

function url_matcher(matcher)
{
	url_matchers.push(matcher)
}

var Страница =
{
	определить: function(url)
	{
		this.эта(this.выяснить_страницу_по_пути(путь_страницы(url)))
	},
	
	выяснить_страницу_по_пути: function(путь)
	{
		if (!путь)
			return 'обложка'
		
		var страница
		
		var tools =
		{
			page: function(page)
			{
				страница = page
			},
			wait: function()
			{
				страница = '_wait_'
				page.data.proceed_manually = true
				return page.proceed
			}
		}
		
		url_matchers.for_each(function()
		{
			if (!страница)
				this.bind(tools)(путь)
		})
		
		if (страница)
			return страница
		
		match_url(путь,
		{
			'люди': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						page.data.адресное_имя = value
						страница = 'человек'
						
						page.data.пользователь_сети = { 'адресное имя': value }
					}
				})
			},
			'сеть/общение': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						страница = 'общение'
						page.data.общение = value
						
						match_url(rest,
						{
							'*': function(value, rest)
							{
								page.data.кому = value
							}
						})
					}
				})
			}
		})
		
		if (страница)
			return страница
		
		return 'страница не найдена'
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

	data:
	{
		режим: {}
	},
	
	event_handlers: [],
	
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
		
		this.Data_store =
		{
			query: {},
			
			modes:
			{
				обычный:
				{
					create: $.noop,
					destroy: $.noop
				}
			},
			
			режим: function(режим, settings)
			{
				Object.for_each(settings, (function(key, value)
				{
					this.modes[режим] = this.modes[режим] || {}
					this.modes[режим][key] = value
					
					if (key === 'destroy')
						this.destroy_modes_when_switching = true
				})
				.bind(this))
			},
			
			create_mode: function(mode, data)
			{
				if (!data)
				{
					data = mode
					mode = null
				}
				
				if (!mode)
					mode = Режим.текущий()
					
				if (this.modes[mode])
					if (this.modes[mode].create)
						return this.modes[mode].create.bind(this)(data)
				
				return this.modes.обычный.create.bind(this)(data)
			},
			
			destroy_mode: function(mode)
			{
				if (!mode)
					mode = Режим.текущий()
					
				if (this.modes[mode])
					if (this.modes[mode].destroy)
						return this.modes[mode].destroy.bind(this)()
				
				return this.modes.обычный.destroy.bind(this)()
			},

			reset_changes: $.noop,
			
			collect_edited: function() { return {} },
			
			draft_persistence: false,
			
			initialize: function(возврат)
			{
				if (!page.save)
					return возврат()
				
				var data_store = this
							
				this.unmodified_data = this.deduce()
				this.edited_data = this.unmodified_data
			
				//this.destroy_mode()
				this.create_mode(this.unmodified_data)
				
				Режим.при_переходе({ в: 'правка' }, function(info)
				{
				})
				
				Режим.при_переходе({ из: 'правка' }, function(info)
				{
					data_store.edited_data = data_store.collect_edited()
				})
				
				Режим.при_переходе(function(info)
				{
					if (!data_store.destroy_modes_when_switching)
						return

					data_store.destroy_mode(info.из)
					
					$(document).on_page_once('режим', function(event, режим)
					{
						data_store.create_mode(info.в, data_store.edited_data)
					})
				})
				
				Режим.activate_edit_actions({ on_save: function()
				{
					if (Режим.правка_ли())
						data_store.edited_data = data_store.collect_edited()
					
					page.save(data_store.edited_data)
				},
				on_discard: function()
				{
					data_store.edited_data = data_store.unmodified_data
					
					if (!Режим.правка_ли())
					{
						data_store.destroy_mode()
						data_store.create_mode(data_store.unmodified_data)
					}
						
					data_store.reset_changes()
					
					if (page.discard)
						page.discard()
				}})
				
				$(document).on_page('режим_изменения_сохранены', function()
				{
					data_store.unmodified_data = data_store.edited_data
				})
				
				if (this.draft_persistence)
					this.load_draft(function(черновик)
					{
						if (черновик)
						{
							data_store.edited_data = черновик
							//data_store.populate_draft(черновик)
							Режим.правка()
						}
							
						return возврат()
					})
				else
					return возврат()
			},
			deduce: function()
			{
				return {}
			},
			load_draft: function(возврат)
			{
				var data_store = this
				
				if (!this.что)
					return возврат()
				
				page.Ajax.get('/приложение/сеть/черновик', Object.x_over_y(data_store.query, { что: this.что }))
				.ok(function(data)
				{
					возврат(data.черновик)
				})
				.ошибка(function()
				{
					error('Не удалось проверить черновик')
					возврат()
				})
			},
			save_draft: function(возврат)
			{
				var data_store = this
				
				if (!this.что)
					return возврат()
				
				page.Ajax.put('/приложение/сеть/черновик', Object.x_over_y(data_store.query, { что: this.что }))
				.ok(function(data)
				{
					возврат()
				})
				.ошибка(function()
				{
					error('Не удалось сохранить черновик')
					возврат()
				})
			}
		}
	},
	
	refresh: function()
	{
		refresh_page()
	},
	
	get: function(selector)
	{
		return this.content.find(selector)
	},
	
	query: function(selector, variable)
	{
		this.queries.push({ variable: variable, selector: selector })
	},
	
	hotkey: function(name, режим, action)
	{
		if (typeof режим === 'function')
		{
			action = режим
			режим = null
		}
		
		eval('var hotkey = Настройки.Клавиши.' + name)
		
		$(document).on_page('keydown', function(event)
		{
			if (Клавиши.is(hotkey, event))
			{
				if (режим)
					if (!Режим[режим + '_ли']())
						return
				
				Клавиши.поймано(event)
				action()
			}
		})
	},
	
	needs_initializing: true,
	
	initialized: function()
	{
		$(document).trigger('page_initialized')
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
		
		Режим.сбросить()
	
		this.unload()
		
		this.event_handlers.for_each(function()
		{
			this.element.unbind(this.event)
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
	},
	
	on: function(element, event, action)
	{
		if (typeof element === 'string')
		{
			action = event
			event = element
			element = $(document)
		}
		
		var namespace
		
		if (!event.contains('.'))
		{
			namespace = $.unique_namespace()
			event += '.' + namespace
		}
			
		this.event_handlers.push({ element: element, event: event })
		element.on(event, action)
		
		return (function()
		{
			element.unbind(event)
			
			if (namespace)
				$.free_namespace(namespace)
		})
		.bind(this)
	},
	
	either_way_loading: function(options)
	{
		var loader = either_way_loading(options)
		this.destroyables.push(loader)
		return loader
	},
	
	ticking: function(action, interval)
	{
		if (this.ticking_actions.has(action))
			return console.log('action already ticking')
		
		this.ticking_actions.push(action.ticking(interval))
	},
	
	track: function(key, value, collector)
	{
		this.tracked[key] = value
		
		this.tracked_collectors[key] = collector
		
		/*
		if (!this.tracked[key])
			this.tracked[key] = []
			
		if (value instanceof Array)
		{
			value.for_each(function(this)
			{
				this.tracked[key].push(value)
			})
		}
		else
			this.tracked[key].push(value)
		*/
	},
	
	пользователь_в_сети: function(пользователь)
	{
	},
	
	пользователь_вышел: function(пользователь)
	{
	},
	
	по_нажатию: function(действие)
	{
		var id = Клавиши.по_нажатию(действие)
		this.по_нажатию_ids.push(id)
		return id
	},
	
	убрать_по_нажатию: function(id)
	{
		this.по_нажатию_ids.remove(id)
		Клавиши.убрать_по_нажатию(id)
	}
})