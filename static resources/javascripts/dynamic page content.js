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
			страницы_плагинов[this] = plugin.title
		})
	})
	
	get_page_less_style_link = function(название_страницы)
	{
		if (!название_страницы)
			название_страницы = Страница.эта()
			
		if (страницы_плагинов[название_страницы])
			return '/plugins/' + страницы_плагинов[название_страницы] + '/pages/' + название_страницы + '.css'
			
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
			
			Less.unload_style(add_version(get_page_less_style_link(Страница.эта())))
		}
		
		clear_previous_page_data()
		
		page = new Page()
		
		page.proceed = function(ошибка)
		{
			if (!first_time_page_loading)
				loading_page()
			
			var finish = function()
			{
				page.content = $('#content')
				$('*').unbind('.page')
				
				if (options.state)
				{
					page.data.scroll_to = options.state.scrolled
				}
				
				$(document).trigger('page_loaded')
				
				if (options.initialized)
					page.initialized()
			}
		
			if (ошибка)
			{
				var error = $('<div/>').addClass('error')
				error.append(ошибка_на_экране(ошибка))
				Page.element.empty().append(error)
				return finish({ initialized: true })
			}
		
			if (!first_time_page_loading)
				panel.highlight_current_page(page)
				
			вставить_содержимое_страницы(finish)
		}
		
		Страница.определить(url)
		
		page.data.данные_для_страницы = данные_пользователя
		
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
			
			if (страницы_плагинов[Страница.эта()])
			{
				var plugin_path = '/plugins/' + страницы_плагинов[Страница.эта()]
				
				load_relevant_translation(plugin_path + '/translation/${language}.json',
				{
					ok: function(язык, перевод)
					{
						подгрузить_перевод(перевод)
					
						if (язык !== Язык)
						{
							console.log('Seems that your preferred language (code «' + Configuration.Locale.Предпочитаемый_язык + '») isn\'t supported by this plugin. ' + 'Defaulting to «' + get_language(язык).name + '»')
						}
						
						теперь_вставить_содержимое_страницы(plugin_path + '/pages/' + Страница.эта())
					},
					no_translation: function()
					{
						console.log('No appropriate translation found for this plugin')
						
						теперь_вставить_содержимое_страницы(plugin_path + '/pages/' + Страница.эта())
					}
				})
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
			
		if (страницы_плагинов[название_страницы])
			return '/plugins/' + страницы_плагинов[название_страницы] + '/pages/' + название_страницы + '.js'
		
		return '/javascripts/на страницах/' + название_страницы.escape_html() + '.js'
	}
})()