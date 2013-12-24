var navigate_to_page
var navigating = false

var between_pages
		
var get_page_less_style_link
var page_data

var next_page_data

;(function()
{	
	var old_page_javascript_link
	var old_page_stylesheet_link
	
	var предыдущая_страница
	
	var new_page_data
	
	page_data = function(key, value)
	{
		if (!value)
		{
			var data_source = new_page_data
			if (!new_page_data)
				data_source = page.data
			
			return data_source[key]
		}
		
		if (!new_page_data)
			return page.data[key] = value
		
		new_page_data[key] = value
	}
		
	var страницы_плагинов = {}
		
	Object.for_each(Configuration.Plugins, function()
	{
		var plugin = this
	
		this.pages.for_each(function()
		{
			var page = plugin.title + '/' + this
			
			страницы_плагинов[page] = plugin.title
			
			var icon = plugin.title
			if (typeof plugin.icon === 'string')
				icon = plugin.icon
			
			Page_icon({ page: page, icon: icon })
		})
	})
	
	get_page_less_style_link = function(название_страницы)
	{
		if (!название_страницы)
			название_страницы = Страница.эта()
			
		var plugin = страницы_плагинов[название_страницы]
		if (plugin)
			return '/plugins/' + plugin + '/pages/' + название_страницы.substring(plugin.length + 1) + '.css'
			
		return '/облик/страницы/' + название_страницы + '.css'
	}
	
	navigate_to_page = function(url, options)
	{
		if (typeof url === 'object')
		{
			options = url
			url = null
		}
		
		if (!url)
			url = Uri.parse(document.location).path
		
		options = options || {}
		
		if (navigating)
		{
			info('Уже идёт загрузка страницы. Ждите.')
			return false
		}
		
		var proceed = function()
		{
			if (page)
				page.unsaved_changes = false
				
			var finish_it = do_navigate_to_page(url, options)
			
			// "do_navigate_to_page" can return "true" to break into the page loading process
			if (typeof finish_it === 'function')
				finish_it()
		}
		
		if (page && page.unsaved_changes)
		{
			discard_changes_confirmation(proceed)
		}
		else
		{
			proceed()
		}
	}
	
	function do_navigate_to_page(url, options)
	{
		if (!проверить_доступ(url))
			return
		
		navigating = true
				
		предыдущая_страница = Страница.эта()
		
		new_page_data = {}
		
		if (between_pages)
			between_pages.destroy()
			
		between_pages = new Between_pages()
		
		Страница.определить(url)
	
		if (options.set_new_url)
			set_new_url(url)
		
		// вызывается здесь, чтобы не было видимой задержки смены иконки
		if (!first_time_page_loading)
			panel.highlight_current_page()
		
		old_page_javascript_link = add_version(get_page_javascript_link(предыдущая_страница))
		old_page_stylesheet_link = add_version(get_page_less_style_link(предыдущая_страница))
			
		if (old_page_javascript_link.contains('"'))
			throw 'Page javascript file can\'t contain double quotes'
		
		function clear_previous_page_data()
		{
			page.navigating_away = true
	
			page.full_unload()
			
			$(document).trigger('page_unloaded')
		
			//Page.element.empty()
		}
		
		if (предыдущая_страница)
			clear_previous_page_data()
		
		page = new Page()
		
		Object.for_each(new_page_data, function(key)
		{
			page.data[key] = this
		})
		
		new_page_data = null
		
		if (!first_time_page_loading)
		{
			Object.for_each(next_page_data, function(key)
			{
				page.data[key] = this
			})
		}
		
		next_page_data = {}
		
		page.proceed = function(ошибка)
		{
			function do_proceed()
			{
				var finish = function()
				{
					page.content = $('#content')
					$('*').unbind('.page')
					
					if (options.state)
						page.data.scroll_to = options.state.scrolled
		
					$(document).trigger('page_initialized')
				}
				
				if (ошибка)
				{
					var error = $('<div/>').addClass('error')
					error.append(ошибка_на_экране(ошибка))
					Page.element.empty().append(error)
					
					page.needs_to_load_content = false
					return finish()
				}
					
				вставить_содержимое_страницы(finish)
			}
		
			if (!first_time_page_loading)
				loading_page(do_proceed)
			else
				do_proceed()
		}
			
		page.data.данные_для_страницы = данные_пользователя
		
		if (!Configuration.Locale.Fixed)
			if (Язык !== данные_пользователя.язык)
				page.Ajax.put('/сеть/пользователь/язык', { язык: Язык })
			
		if (!page.data.proceed_manually)
			return page.proceed
		
		return true
	}
	
	function вставить_содержимое_страницы(возврат)
	{
		var path = '/страницы/' + Страница.эта()
		var plugin = страницы_плагинов[Страница.эта()]
		
		if (plugin)
			path = '/plugins/' + plugin + '/pages/' + Страница.эта().substring(plugin.length + 1)
			
		вставить_содержимое(path + '.html', page.data.данные_для_страницы,
		{
			on_error: function()
			{
				Страница.эта('страница не найдена')
				вставить_содержимое_страницы(возврат)
			},
			before: function(proceed)
			{
				вставить_javascript(function()
				{
					page.preload(function()
					{
						var finish = function()
						{
							Page.element.empty()
							вставить_стиль()
							proceed()
						}
						
						finish()
						 
						/*
						if (first_time_page_loading)
							return finish()
						
						html2canvas(Page.element.node(),
						{
							onrendered: function(previous_page_screenshot)
							{
								document.id('previous_page').prepend(previous_page_screenshot)
								finish()
							}
						})
						*/
					})
				})
			}
		},
		возврат)
	}
	
	function вставить_javascript(callback)
	{
		if (first_time_page_loading)
			return insert_script(get_page_javascript_link(), callback)
		
		// delete previous page javascript
		if (Configuration.Optimize)
			$('head').find('> script[for="' + old_page_javascript_link + '"]').remove()
		else
			$('head').find('> script[src="' + old_page_javascript_link + '"]').remove()
		
		insert_script(get_page_javascript_link(), callback)
	}
	
	function вставить_стиль()
	{
		if (first_time_page_loading)
			return insert_style(get_page_less_style_link())
	
		if (Страница.эта() === предыдущая_страница)
			return

		// delete previous page stylesheet
		
		if (Configuration.Optimize)
			Dom.remove(head.querySelector('style[for="' + old_page_stylesheet_link + '"]'))
		else
			Less.unload_style(old_page_stylesheet_link)
			
		insert_style(get_page_less_style_link())
	}
	
	function get_page_javascript_link(название_страницы)
	{
		if (!название_страницы)
			название_страницы = Страница.эта()
			
		var plugin = страницы_плагинов[название_страницы]
		if (plugin)
			return '/plugins/' + plugin + '/pages/' + название_страницы.substring(plugin.length + 1) + '.js'
		
		return '/javascripts/на страницах/' + название_страницы.escape_html() + '.js'
	}
})()

var Between_pages = new Class
({
	ajaxes: [],
	
	initialize: function()
	{
		var ajaxes = this.ajaxes
		
		this.Ajax =
		{
			get: function(url, data, options)
			{
				var result = Ajax.get(url, data, options)
				ajaxes.push(result)
				return result
			},
			
			post: function(url, data, options)
			{
				var result = Ajax.post(url, data, options)
				ajaxes.push(result)
				return result
			},
			
			put: function(url, data, options)
			{
				var result = Ajax.put(url, data, options)
				ajaxes.push(result)
				return result
			},
			
			'delete': function(url, data, options)
			{
				var result = Ajax['delete'](url, data, options)
				ajaxes.push(result)
				return result
			}		
		}
	},
	
	destroy: function()
	{
		this.ajaxes.for_each(function()
		{
			this.expire()
			this.abort()
		})
	}
})