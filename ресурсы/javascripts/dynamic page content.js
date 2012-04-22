var подгрузить_шаблоны
var вставить_общее_содержимое
var navigate_to_page
var раздел_или_заметка

var navigating = false;
	
(function()
{
	var кусочки = ['loading popup', 'simple value dialog window', 'unsupported browser popup', 'наглядный писарь', 'нижняя панель режима правки', 'окошко входа']
	var шаблоны = ['маленький аватар', 'chat user icon']
	
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
				Ajax.get('/страницы/кусочки/' + шаблон + '.html', {}, { type: 'html' })
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
				вставить_содержимое('/страницы/кусочки/' + кусочек + '.html', {}, { куда: $('body') }, callback)
			})
		}
		
		подгрузить_шаблоны(function()
		{
			вставить_кусочки(function()
			{
				callback()
			})
		})
	}
	
	var данные_пользователя = {}
	
	вставить_общее_содержимое = function(возврат)
	{
		function получить_пользовательские_данные_для_страницы(возврат)
		{
			Ajax.get('/приложение/пользовательские_данные_для_страницы')
			.ошибка(function(ошибка)
			{
				// если кука user - кривая, то она уже сама удалилась на сервере,
				// и просто перезагрузить страницу, чтобы войти в качестве гостя
				if (ошибка === 'Пользователь не найден')
					return window.location.reload()
				
				page_loading_error()
			})
			.ok(function(данные) 
			{
				данные_пользователя = данные
				
				пользователь = данные.пользователь
				
				if (!пользователь && Страница.эта().starts_with('сеть/'))
					window.location = '/'
	
				возврат()
			})
		}
		
		function вставить_пользовательское_содержимое(возврат)
		{
			вставить_содержимое('/страницы/кусочки/user content.html', данные_пользователя, { куда: $('body') }, возврат)
		}
		
		function вставить_гостевое_содержимое(возврат)
		{
			вставить_содержимое('/страницы/кусочки/guest content.html', {}, { куда: $('body') }, возврат)
		}
		
		if ($.cookie('user'))
		{
			получить_пользовательские_данные_для_страницы(function()
			{
				вставить_пользовательское_содержимое(function()
				{
					возврат()
				})
			})
		}
		else
			вставить_гостевое_содержимое(function()
			{
				возврат()
			})
	}
	
	var new_page
	
	navigate_to_page = function(url, options)
	{
		options = options || {}
		
		if (navigating)
		{
			info('Уже идёт загрузка страницы. Ждите.')
			return false
		}
		
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
			
			//new_page.data.данные_для_страницы.название_страницы = Страница.эта()
			//page.data.название_страницы = new_page.data.данные_для_страницы.название_страницы
		
			var finish = function()
			{
				content = $('#content')
				$('*').unbind('.page')
				$(document).trigger('page_loaded')
			}
		
			if (ошибка)
			{
				var error = $('<div/>').addClass('error')
				error.append(ошибка_на_экране(ошибка))
				Page.element.empty().append(error)
				return finish()
			}
		
			вставить_содержимое_страницы(finish)
		}
		
		var предыдущее_название_страницы = Страница.эта()
		Страница.определить(url, new_page, proceed)
		
		if (!first_time_page_loading)
			panel.highlight_current_page()
						
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
		
			Page.element.empty()
			
			Less.unload_style(get_page_less_style_link(предыдущее_название_страницы))
			//$('head').find('script[src="' + get_page_javascript_link(предыдущее_название_страницы) + '"]').remove()
		}
		
		function вставить_содержимое_страницы(возврат)
		{
			вставить_содержимое('/страницы/' + Страница.эта() + '.html', new_page.data.данные_для_страницы,
			{
				on_error: function()
				{
					Страница.эта('страница не найдена')
					вставить_содержимое_страницы(возврат)
				},
				before: вставить_стиль_и_javascript
			}, возврат)
		}
		
		function вставить_стиль_и_javascript(callback)
		{
			$('<link/>').attr('rel', 'stylesheet/less').attr('href', '/облик/страницы/' + Страница.эта() + '.css').appendTo('head')
		
			$.ajax
			({
				url: get_page_javascript_link(),
				dataType: "script",
				success: function() { callback() },
				error: function() { alert('Page script not loaded (possible syntax error): ' + get_page_javascript_link()) }
			})
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
		options = options || {}
		
		var ajax = Ajax
		
		if (new_page)
			ajax = new_page.Ajax
		
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
			
			var after = function()
			{
				if (!options.куда)
					options.куда = Page.element
					
				options.куда.append($.tmpl(url, данные))
				возврат()
			}
			
			if (options.before)
				options.before(after)
			else
				after()
		})
	}
	
	раздел_или_заметка = function(путь, возврат)
	{
		new_page.Ajax.get('/приложение/раздел или заметка?', { путь: путь })
		.ошибка(function(ошибка, уровень)
		{
			возврат({ текст: ошибка, уровень: уровень })
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
	return '/облик/страницы/' + название_страницы + '.css'
}

function get_page_javascript_link(название_страницы)
{
	if (!название_страницы)
		название_страницы = Страница.эта()
	return '/javascripts/на страницах/' + название_страницы.escape_html() + '.js'
}