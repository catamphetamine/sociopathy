var подгрузить_статику
var вставить_общее_содержимое
var вставить_содержимое

;(function()
{
	// сразу вставляются на страницу
	var кусочки =
	[
		'loading popup',
		'simple value dialog window',
		'unsupported browser popup',
		'навершие',
		'наглядный писарь',
		'нижняя панель режима правки',
		'окошко входа',
		'unsaved changes'
	]
	
	// компилируются
	var шаблоны =
	[
		'маленький аватар',
		'user icon',
		'linked user icon',
		'message user icon',
		'breadcrumbs',
		'either way loading',
		'личная карточка',
		'пошаговое окошко'
	]
	
	шаблоны = шаблоны.map(function(шаблон)
	{
		var info =
		{
			name: шаблон,
			url: '/страницы/шаблоны/' + шаблон + '.html'
		}
		
		return info
	})
	
	Object.for_each(Configuration.Plugins, function(plugin)
	{
		this.templates.forEach(function(шаблон)
		{
			шаблоны.push
			({
				name: шаблон,
				url: '/plugins/' + plugin + '/templates/' + шаблон + '.html'
			})
		})
	})
	
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
			Ajax.get(add_version(шаблон.url), {}, { type: 'html' })
			.ошибка(function()
			{
				page_loading_error()
				возврат(true)
			})
			.ok(function(template) 
			{
				$.template(шаблон.name, template)
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
					Object.for_each(Configuration.Plugins, function(key)
					{
						if (typeof this.icon === 'object')
							if (!this.icon.private)
								add_top_panel_button.bind(this)(this)
					})
					
					callback()
				}
			}
			
			вставить_содержимое('/страницы/кусочки/' + кусочек + '.html', {}, { куда: $('body') }, возврат)
		})
	}
	
	function подгрузить_переводы_плагинов(возврат)
	{
		var плагинов_осталось = Object.size(Configuration.Plugins)
		
		Object.for_each(Configuration.Plugins, function()
		{
			подгрузить_перевод_плагина(this, function()
			{
				плагинов_осталось--
				
				if (плагинов_осталось > 0)
					return
				
				возврат()
			})
		})
	}
	
	function подгрузить_перевод_плагина(plugin, возврат)
	{
		load_relevant_translation('/plugins/' + plugin.title + '/translation/${language}.json',
		{
			ok: function(язык, перевод)
			{
				подгрузить_перевод(перевод)
			
				/*
				if (язык !== Язык)
				{
					console.log('Seems that your preferred language (code «' + Configuration.Locale.Предпочитаемый_язык + '») isn\'t supported by this plugin. ' + 'Defaulting to «' + get_language(язык).name + '»')
				}
				*/
				
				возврат()
			},
			no_translation: function()
			{
				console.log('No appropriate translation found for this plugin')
				
				возврат()
			}
		})
	}
	
	function подгрузить_скрипты_плагинов(возврат)
	{
		var плагинов_осталось = Object.size(Configuration.Plugins)
		
		Object.for_each(Configuration.Plugins, function()
		{
			подгрузить_скрипты_плагина(this, function()
			{
				плагинов_осталось--
				
				if (плагинов_осталось > 0)
					return
				
				возврат()
			})
		})
	}
	
	function подгрузить_скрипты_плагина(plugin, возврат)
	{
		var скрипты = plugin.client_scripts
		var counter = скрипты.length
		
		if (!counter)
			return возврат()
		
		var callback = function()
		{
			counter--
			if (counter === 0)
				возврат()
		}
		
		скрипты.forEach(function(script)
		{
			insert_script('/plugins/' + plugin.title + '/client scripts/' + script + '.js', callback)
		})
	}
	
	function page_loading_error(error)
	{
		$('#loading_screen').attr('status', 'error')
		
		var content = $('#loading_screen .content')
		content.find('.loading').hide()
		
		if (error)
			content.find('.error').text(error)
			
		content.find('.error').show()
	}
		
	подгрузить_статику = function(callback)
	{
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
				
				подгрузить_переводы_плагинов(function()
				{
					подгрузить_скрипты_плагинов(function()
					{
						callback()
					})
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
	
	вставить_содержимое = function(url, данные, options, возврат)
	{
		url = add_version(url)
		
		options = options || {}
		
		var ajax = Ajax
		
		if (page)
			ajax = page.Ajax
			
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
})()