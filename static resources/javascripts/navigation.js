var navigate_to_page
var navigating = false

var get_page_less_style_link

;(function()
{
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
				
			do_navigate_to_page(url, options)
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
		
		if (options.before)
			options.before()
				
		function clear_previous_page_data()
		{
			if (!Страница.эта())
				return
	
			page.full_unload()
			$(document).trigger('page_unloaded')
		
			Page.element.empty()
			
			if (add_version(get_page_javascript_link()).contains('"'))
				throw 'Page javascript file can\'t contain double quotes'
			
			$('head').find('> script[src="' + add_version(get_page_javascript_link()) + '"]').remove()
			Less.unload_style(add_version(get_page_less_style_link(Страница.эта())))
		}
		
		clear_previous_page_data()
		page = new Page()
		
		page.proceed = function(ошибка)
		{
			function do_proceed()
			{
				var finish = function()
				{
					page.content = $('#content')
					$('*').unbind('.page')
					
					if (options.state)
					{
						page.data.scroll_to = options.state.scrolled
					}
		
					$(document).trigger('page_loaded')
				}
				
				if (ошибка)
				{
					var error = $('<div/>').addClass('error')
					error.append(ошибка_на_экране(ошибка))
					Page.element.empty().append(error)
					finish()
					page.initialized()
				}
					
				вставить_содержимое_страницы(finish)
			}
			
			if (!first_time_page_loading)
				loading_page(do_proceed)
			else
				do_proceed()
		}
		
		Страница.определить(url)
		
		page.data.данные_для_страницы = данные_пользователя
		
		if (!first_time_page_loading)
			panel.highlight_current_page(page)
			
		if (!page.data.proceed_manually)
			page.proceed()
		
		function вставить_содержимое_страницы(возврат)
		{
			function теперь_вставить_содержимое_страницы(template_path)
			{
				вставить_содержимое(template_path + '.html', page.data.данные_для_страницы,
				{
					on_error: function()
					{
						Страница.эта('страница не найдена')
						вставить_содержимое_страницы(возврат)
					},
					before: вставить_стиль_и_javascript
				},
				возврат)
			}
			
			var plugin = страницы_плагинов[Страница.эта()]
			
			if (plugin)
			{
				теперь_вставить_содержимое_страницы('/plugins/' + plugin + '/pages/' + Страница.эта().substring(plugin.length + 1))
			}
			else
			{
				теперь_вставить_содержимое_страницы('/страницы/' + Страница.эта())
			}
		}
		
		function вставить_стиль_и_javascript(callback)
		{
			insert_style(get_page_less_style_link())
			insert_script(get_page_javascript_link(), callback)
		}
		
		return true
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