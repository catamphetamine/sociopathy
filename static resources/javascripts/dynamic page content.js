var подгрузить_шаблоны
var вставить_общее_содержимое
var navigate_to_page
var раздел_или_заметка

var navigating = false

var страницы_плагинов = {}
		
;(function()
{
	Object.for_each(Configuration.Plugins, function()
	{
		var plugin = this
		
		this.pages.for_each(function()
		{
			страницы_плагинов[this] = plugin.title
		})
	})

	var кусочки =
	[
		'loading popup',
		'simple value dialog window',
		'unsupported browser popup',
		'навершие',
		'наглядный писарь',
		'нижняя панель режима правки',
		'окошко входа'
	]
	
	var шаблоны =
	[
		'маленький аватар',
		'user icon',
		'linked user icon',
		'chat user icon',
		'содержимое мусорки',
		'ошибки',
		'обсуждение в списке обсуждений',
		'беседа в списке бесед',
		'сообщение обсуждения',
		'сообщение беседы',
		'breadcrumbs',
		'сообщение в болталке',
		'either way loading',
	]
	
	подгрузить_шаблоны = function(callback)
	{
		function подгрузить_шаблоны(возврат)
		{
			var counter = шаблоны.length
			var callback = function()
			{
				counter--
				if (counter === 0)
					возврат()
			}
			
			шаблоны.forEach(function(шаблон)
			{
				Ajax.get(add_version('/страницы/кусочки/' + шаблон + '.html'), {}, { type: 'html' })
				.ошибка(function()
				{
					page_loading_error()
					возврат(true)
				})
				.ok(function(template) 
				{
					$.template(шаблон, template)
					callback()
				})
			})
		}
	
		function вставить_кусочки(возврат)
		{
			var counter = кусочки.length
			var callback = function()
			{
				counter--
				if (counter === 0)
					возврат()
			}
			
			кусочки.forEach(function(кусочек)
			{
				var возврат = callback
				
				if (кусочек === 'навершие')
				{
					возврат = function()
					{
						Object.for_each(Configuration.Old_plugins, function(key)
						{
							if (!this.private)
								add_top_panel_button.bind(this)()
						})
						
						Object.for_each(Configuration.Plugins, function(key)
						{
							if (!this.icon.private)
								add_top_panel_button.bind(this)()
						})
						
						callback()
					}
				}
				
				вставить_содержимое('/страницы/кусочки/' + кусочек + '.html', {}, { куда: $('body') }, возврат)
			})
		}
		
		function вставить_шаблоны_плагинов(возврат)
		{
			var плагинов_осталось = Object.size(Configuration.Plugins)
			
			Object.for_each(Configuration.Plugins, function()
			{
				вставить_шаблоны_плагина(this, function()
				{
					плагинов_осталось--
					
					if (плагинов_осталось > 0)
						return
					
					возврат()
				})
			})
		}
		
		function вставить_шаблоны_плагина(plugin, возврат)
		{
			var шаблоны = plugin.templates
			
			var counter = шаблоны.length
			var callback = function()
			{
				counter--
				if (counter === 0)
					возврат()
			}
			
			шаблоны.forEach(function(шаблон)
			{
				Ajax.get(add_version('/plugins/' + plugin.title + '/templates/' + шаблон + '.html'), {}, { type: 'html' })
				.ошибка(function()
				{
					page_loading_error()
					возврат(true)
				})
				.ok(function(template) 
				{
					$.template(шаблон, template)
					callback()
				})
			})
		}
		
		подгрузить_шаблоны(function(ошибка)
		{
			if (ошибка)
				return callback(true)
				
			вставить_кусочки(function()
			{
				var menu = $('#panel_menu')
				var menu_items = menu.children()
				menu.empty().append(menu_items)
				
				$('#panel').appendTo('nav').css('display', 'block')
				
				вставить_шаблоны_плагинов(function()
				{
					if (ошибка)
						return callback(true)
				
					callback()
				})
			})
		})
	}
	
	вставить_общее_содержимое = function(возврат)
	{
		function вставить_пользовательское_содержимое(возврат)
		{
			вставить_содержимое('/страницы/кусочки/user content.html', данные_пользователя, { куда: $('body') }, возврат)
		}
		
		function вставить_гостевое_содержимое(возврат)
		{
			вставить_содержимое('/страницы/кусочки/guest content.html', {}, { куда: $('body') }, возврат)
		}
		
		if (пользователь)
			вставить_пользовательское_содержимое(возврат)
		else
			вставить_гостевое_содержимое(возврат)
	}
	
	var new_page
	
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
				
		new_page = new Page()
		
		var immediate_loading_page
		function proceed(ошибка)
		{
			if (!first_time_page_loading)
				immediate_loading_page()
			
			clear_previous_page_data()
			page = new_page
			
			//$(document).trigger('page') //, { first_time: first_time_page_loading })
				
			//new_page.data.данные_для_страницы.название_страницы = Страница.эта()
			//page.data.название_страницы = new_page.data.данные_для_страницы.название_страницы
		
			var finish = function(options)
			{
				options = options || {}
				
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
		
			вставить_содержимое_страницы(finish)
		}
		
		var предыдущее_название_страницы = Страница.эта()
		Страница.определить(url, new_page, proceed)
		
		if (!first_time_page_loading)
			panel.highlight_current_page(new_page)
						
		if (!first_time_page_loading)
			immediate_loading_page = loading_page()
		
		//new_page.data.данные_для_страницы = {}
		//new_page.data.данные_для_страницы = Object.merge(new_page.data.данные_для_страницы, данные_пользователя)
		
		new_page.data.данные_для_страницы = данные_пользователя
		
		if (!new_page.data.breaks_from_normal_workflow)
			proceed()
	
		function clear_previous_page_data()
		{
			if (!предыдущее_название_страницы)
				return
	
			page.full_unload()
			$(document).trigger('page_unloaded')
		
			Page.element.empty()
			
			Less.unload_style(add_version(get_page_less_style_link(предыдущее_название_страницы)))
		}
		
		function вставить_содержимое_страницы(возврат)
		{
			function теперь_вставить_содержимое_страницы(template_path)
			{
				вставить_содержимое(template_path + '.html', new_page.data.данные_для_страницы,
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
	
	function page_loading_error(error)
	{
		//var error = $('<div class="page_loading_error">' + error + '</div>')
		//error.disableTextSelect()
		
		$('#loading_screen').attr('status', 'error')
		
		var content = $('#loading_screen .content')
		content.find('.loading').hide()
		
		if (error)
			content.find('.error').text(error)
			
		content.find('.error').show()
	}
	
	function вставить_содержимое(url, данные, options, возврат)
	{
		url = add_version(url)
		
		options = options || {}
		
		var ajax = Ajax
		
		if (new_page)
			ajax = new_page.Ajax
			
		var вставить = function(шаблон)
		{
			var after = function()
			{
				if (!options.куда)
					options.куда = Page.element
					
				options.куда.append($.tmpl(шаблон, данные))
				возврат()
			}
			
			if (options.before)
				options.before(after)
			else
				after()
		}
		
		ajax.get(url, {}, { type: 'html' })
		.ошибка(function()
		{
			if (options.on_error)
				return options.on_error()
				
			page_loading_error()
		})
		.ok(function(template) 
		{
			$.template(url, template)
			
			вставить(url)
		})
	}
	
	раздел_или_заметка = function(путь, возврат)
	{
		new_page.Ajax.get('/приложение/раздел или заметка', { путь: путь })
		.ошибка(function(ошибка, options)
		{
			if (ошибка === 'not found')
				ошибка = 'Раздел или заметка «' + путь + '» не найдены'
			
			возврат({ текст: ошибка, уровень: options.уровень })
		})
		.ok(function(данные) 
		{
			if (данные.заметка)
			{
				Страница.эта('заметка')
				new_page.data.данные_для_страницы.заметка = данные.заметка
				new_page.data.путь_к_заметке = путь
				new_page.data.заметка = данные.заметка
			}
			else
			{
				Страница.эта('читальня')
				new_page.data.раздел = данные.раздел
				new_page.data.путь_к_разделу = путь
			}
	
			возврат()
		})
	}
})()

function get_page_less_style_link(название_страницы)
{
	if (!название_страницы)
		название_страницы = Страница.эта()
		
	if (страницы_плагинов[название_страницы])
		return '/plugins/' + страницы_плагинов[название_страницы] + '/pages/' + название_страницы + '.css'
		
	return '/облик/страницы/' + название_страницы + '.css'
}

function get_page_javascript_link(название_страницы)
{
	if (!название_страницы)
		название_страницы = Страница.эта()
		
	if (страницы_плагинов[название_страницы])
		return '/plugins/' + страницы_плагинов[название_страницы] + '/pages/' + название_страницы + '.js'
	
	return '/javascripts/на страницах/' + название_страницы.escape_html() + '.js'
}