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
		
		var страница_человека = false
		
		var better_match = function(url, pattern)
		{
			var matcher = {}
			
			Object.for_each(pattern, function(key, action)
			{
				var path = key
				
				if (key !== '*')
				{
					path = text(key)
					
					if (path.starts_with('/'))
						path = path.substring(1)
				}
					
				matcher[path] = action
			})

			match_url(url, matcher)
		}
		
		better_match(путь,
		{
			'pages.people.url': function(rest)
			{
				better_match(rest,
				{
					'*': function(value, rest)
					{
						страница_человека = true
						
						page_data('пользователь_сети', { id: value })
						
						if (пользователь)
							if (пользователь.id === value)
								page_data('этот_пользователь', true)
					}
				})
			}
		})
			
		var страница
		
		var tools = function(id)
		{
			var result = 
			{
				id: id || '',
				page: function(page)
				{
					if (this.id)
						page = this.id + '/' + page
					
					страница = page
				},
				icon: function(icon)
				{
					if (!icon)
						icon = this.id
					
					page_data('_icon', icon)
				},
				wait: function()
				{
					страница = '_wait_'
					page_data('proceed_manually', true)
					return function()
					{
						page.proceed()
					}
				},
				match: better_match
			}
			
			return result
		}
		
		url_matchers.for_each(function()
		{
			if (!страница)
				this.bind(tools())(путь)
		})
		
		if (страница)
			return страница
		
		if (страница_человека)
			return 'человек'
		
		var new_communication_matcher = {}
		var pattern = text('url.network').substring(1) + '/' + text('url.new communication')
		new_communication_matcher[pattern] = function(rest)
		{
			match_url(rest,
			{
				'*': function(value, rest)
				{
					страница = 'общение'
					page_data('общение', value)
					
					match_url(rest,
					{
						'*': function(value, rest)
						{
							page_data('кому', value)
						}
					})
				}
			})
		}
		
		match_url(путь, new_communication_matcher)
		
		if (страница)
			return страница
		
		better_match(путь,
		{
			'url.login required': function(rest)
			{
				страница = 'требуется вход'
			},
			'url.error': function(rest)
			{
				страница = 'ошибка'
			},
			'url.registration': function(rest)
			{
				страница = 'прописка'
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
	
	dialog_windows: [],
	context_menus: [],
	
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
		
		this.Available_actions = new (new Class
		({
			Binds: ['show'],
			
			actions: [],
			
			add: function(title, action, options)
			{
				options = options || {}
				
				this.actions.add({ title: title, action: action, options: options })
				
				if (options.действие)
					page.hotkey('Действия.' + options.действие, action)
			},
			
			show: function()
			{
				this.available_actions_list.open()
			},
			
			is_empty: function()
			{
				return this.actions.пусто()
			},
			
			destroy: function()
			{
				if (this.is_empty())
					return
				
				if (this.available_actions_list)
					this.available_actions_list.destroy()
			},
			
			each: function(method)
			{
				this.actions.for_each(method)
			}
		}))(),
		
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
				{
					if (this.modes[mode].create)
						this.modes[mode].create.bind(this)(data)
						
					if (this.modes[mode].context_menus)
						this.modes[mode].context_menus()
						
					return
				}
				
				return this.modes.обычный.create.bind(this)(data)
			},
			
			destroy_mode: function(mode)
			{
				if (!mode)
					mode = Режим.текущий()
					
				if (this.modes[mode])
				{
					if (this.modes[mode].destroy)
						this.modes[mode].destroy.bind(this)()
					
					return
				}
				
				return this.modes.обычный.destroy.bind(this)()
			},

			reset_changes: function()
			{
				page.reload()
			},
			
			collect_edited: function() { return {} },
			
			draft_persistence: false,
			
			unmodified_data: {},
			
			initialize: function(возврат)
			{
				if (!page.save)
					return возврат()
				
				this.enabled = true
				
				var data_store = this
							
				if (this.collect_initial_data)
					this.collect_initial_data(this.unmodified_data)
					
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

					var scroll = $(window).scrollTop()
					data_store.destroy_mode(info.из)
					
					$(document).on_page_once('режим', function(event, режим)
					{
						data_store.create_mode(info.в, data_store.edited_data)
						прокрутчик.scroll_to(scroll)
					})
				})
				
				Режим.activate_edit_actions({ on_save: this.save_changes.bind(this),
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
			
			save_changes: function()
			{
				if (Режим.правка_ли())
					this.edited_data = this.collect_edited()
				
				page.unsaved_changes = false
			
				page.save(this.edited_data)
			},
			
			new_data_loaded: function(updater)
			{
				updater(this.unmodified_data)
				
				if (this.edited_data)
					updater(this.edited_data)
			},
			
			load_draft: function(возврат)
			{
				var data_store = this
				
				if (!this.что)
					return возврат()
				
				page.Ajax.get('/сеть/черновик', Object.x_over_y(data_store.query, { что: this.что }))
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
				
				page.Ajax.put('/сеть/черновик', Object.x_over_y(data_store.query, { что: this.что }))
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
		if (!next_page_data.scrolled_before_refresh)
			next_page_data.scrolled_before_refresh = прокрутчик.scrolled()

		navigate_to_page(Uri.parse().to_relative_url())
	},
	
	reload: function()
	{
		this.refresh()
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
		hotkey.bind(this)(name, режим, action)
	},
	
	needs_to_load_content: true,
	
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
			this.Data_store.destroy_mode()
	
		Режим.сбросить()
	
		this.unload()
		
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
	},
	
	context_menu: function(element, options)
	{
		var menu = new Context_menu(element, options)
		this.context_menus.add(menu)
		return menu
	},
	
	dialog_window: function(element, options)
	{
		var window = element.dialog_window(options)
		this.dialog_windows.add(window)
		return window
	},
	
	register_dialog_window: function(dialog_window)
	{
		this.dialog_windows.add(dialog_window)
	},
	
	create_actions_list: function()
	{
		if (this.Available_actions.is_empty())
		{
			return this.hotkey('Показать_действия', function()
			{
				info(text('page.no available actions'))
			})
		}
		
		var actions_list_window = $('<div/>')
			.addClass('available_actions')
			.attr('title', text('page.available actions'))
			
		var actions_list = $('<ul/>').appendTo(actions_list_window)
		
		var dialog_window
		
		this.Available_actions.each(function()
		{
			var action = this.action
			var options = this.options
			
			var button = $('<div/>')
				.text(this.title)
			
			if (options.type)
				button.attr('type', options.type)
				
			if (options.styles)
				button.attr('styles', options.styles)
				
			$('<li/>').append(button).appendTo(actions_list)
			
			new text_button(button).does(function()
			{
				if (options.immediate_transition_between_dialog_windows)
				{
					var dialog_window_options =
					{
						immediately: true,
						leave_modal: true
					}
					
					action(dialog_window_options)
					dialog_window.close(dialog_window_options)
					return
				}
				
				dialog_window.close(action)
			})
		})
		
		dialog_window = actions_list_window.dialog_window
		({
			'close on escape': true
		})
		
		dialog_window.content.disableTextSelect()
		
		this.Available_actions.available_actions_list = dialog_window
		
		this.hotkey('Показать_действия', function()
		{
			page.Available_actions.show()
		})
	},
	
	on: function(element, event, action, options)
	{
		if (typeof element === 'string')
		{
			options = action
			action = event
			event = element
			
			element = $(document)
		}
		
		options = options || {}
		
		var namespace
		
		if (!event.contains('.'))
		{
			namespace = $.unique_namespace()
			event += '.' + namespace
		}
		
		var info = { element: element, event: event, options: options }
			
		this.event_handlers.add(info)
		element.on(event, action)
		
		return (function()
		{
			if (!this.event_handlers.has(info))
				return
				
			this.event_handlers.remove(info)
			
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
	},
	
	очередь_подсказок: [],
	
	показывать_подсказки: true,
	
	показать_следующую_подсказку: function()
	{
		if (!this.показывать_подсказки)
			return
		
		if (this.показанная_подсказка)
			return
		
		if (this.очередь_подсказок.is_empty())
			return
		
		var подсказка = this.очередь_подсказок.shift()
		
		this.показанная_подсказка = подсказка
		
		var страница = this
		
		function next()
		{
			страница.показанная_подсказка = null
			страница.показать_следующую_подсказку()
		}
		
		var result = Подсказка(подсказка.id, подсказка.text, { on_vanish: next })
		
		if (!result)
			next()
	},
	
	подсказка: function(id, text)
	{
		if (!this.очередь_подсказок.filter(function(подсказка) { return подсказка.id === id }).is_empty())
			return
	
		this.очередь_подсказок.add({ id: id, text: text })
		this.показать_следующую_подсказку()
	}
})

$.fn.on_page = function(event, action, options)
{
	if (!page)
		throw 'Page hasn\'t been initialized yet'
	
	return page.on(this, event, action, options)
}

$.fn.on_page_once = function(event, action, options)
{
	var cancel
	
	var new_action = function(event, data)
	{
		action(event, data)
		cancel()
	}
	
	cancel = this.on_page(event, new_action, options)
}