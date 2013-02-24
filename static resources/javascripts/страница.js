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
						new_page.data.общение = { id: value }
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
						new_page.data.общение = { id: value }
					}
				})
			},
			'сеть/общение': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						название_страницы = 'сеть/общение'
						new_page.data.общение = value
						
						match_url(rest,
						{
							'*': function(value, rest)
							{
								new_page.data.кому = value
							}
						})
					}
				})
			},
			'сеть/читальня/заметка': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						название_страницы = 'сеть/читальня/заметка'
						new_page.data.раздел = value
					}
				})
			},
			'сеть/книги': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						var int_value = parseInt(value)
						if (int_value == value && int_value > 0)
						{
							new_page.data.номер_страницы = int_value
							название_страницы = 'сеть/книги'
							return
						}
						
						название_страницы = 'сеть/книги'
						return
						
						//new_page.data.книга = { id: value }
						//название_страницы = 'сеть/книга'
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
					data_store.watch_for_changes = true
				})
				
				Режим.при_переходе({ из: 'правка' }, function(info)
				{
					if (data_store.watch_for_changes)
						data_store.edited_data = data_store.collect_edited()
					else
						data_store.edited_data = data_store.unmodified_data
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
					
					data_store.watch_for_changes = false
					page.save(data_store.edited_data, function()
					{
						if (!Режим.правка_ли())
						{
							data_store.destroy_mode()
							data_store.create_mode('обычный', data_store.edited_data)
						}
					})
				},
				on_discard: function()
				{
					data_store.watch_for_changes = false
					
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
	
	namespaces: {},
	
	unique_namespace: function()
	{
		var namespace = (Math.random() + '').substring(2)
		
		if (this.namespaces[namespace])
			return this.unique_namespace()
		
		this.namespaces[namespace] = true
		
		return namespace
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
			namespace = this.unique_namespace()
			event += '.' + namespace
		}
			
		this.event_handlers.push({ element: element, event: event })
		element.on(event, action)
		
		return (function()
		{
			element.unbind(event)
			
			if (namespace)
				delete this.namespaces[namespace]
		})
		.bind(this)
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