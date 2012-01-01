$(function()
{
	var название_страницы = путь_страницы()
		
	if (!название_страницы)
		название_страницы = 'обложка'
		
	var данные_для_страницы = {}

	if (название_страницы.starts_with('люди/')
		&& название_страницы.length > 'люди/'.length)
	{
		название_страницы = 'человек'
	}
			
	if (название_страницы.starts_with('читальня/'))
	{
		var путь = название_страницы.substring('читальня/'.length)
		данные_для_страницы.путь = путь
		раздел_или_заметка(путь, proceed)
	}
	else
		proceed()

	function proceed()
	{
		данные_для_страницы.название_страницы = название_страницы
			
		if ($.cookie('user'))
		{
			получить_пользовательские_данные_для_страницы(function()
			{
				вставить_пользовательское_содержимое(function()
				{
					вставить_содержимое_страницы(function()
					{
						$(document).trigger('fully_loaded')
					})
				})
			})
		}
		else
			вставить_гостевое_содержимое(function()
			{
				вставить_содержимое_страницы(function()
				{
					$(document).trigger('fully_loaded')
				})
			})
	}

	function раздел_или_заметка(путь, возврат)
	{
		Ajax.get('/приложение/раздел или заметка?', { путь: путь },
		{
			error: function(ошибка)
			{
				page_loading_error('Что-то сломалось')
			},
			ok: function(данные) 
			{
				if (данные.заметка)
				{
					название_страницы = 'заметка'
					данные_для_страницы = Object.merge(данные_для_страницы, данные)
				}
				else					
					название_страницы = 'читальня'

				возврат()
			}
		})
	}
	
	function получить_пользовательские_данные_для_страницы(возврат)
	{
		Ajax.get('/приложение/пользовательские_данные_для_страницы', 
		{
			error: function(ошибка)
			{
				// если кука user - кривая, то она уже сама удалилась на сервере,
				// и просто перезагрузить страницу, чтобы войти в качестве гостя
				if (ошибка === 'Пользователь не найден')
					return window.location.reload()
				
				page_loading_error('Что-то сломалось')
			},
			ok: function(данные) 
			{
				данные_для_страницы = Object.merge(данные_для_страницы, данные)
				
				пользователь = данные.пользователь
				
				возврат()
			}
		})
	}

	function вставить_содержимое_страницы(возврат)
	{
		вставить_содержимое('/страницы/' + название_страницы + '.html', данные_для_страницы, возврат,
		{
			on_error: function()
			{
				название_страницы = 'страница не найдена'
				вставить_содержимое_страницы(возврат,
				{
					before: вставить_стиль_и_javascript
				})
			},
			before: вставить_стиль_и_javascript
		})
	}
	
	function вставить_стиль_и_javascript()
	{
		$('head').append('<link rel="stylesheet/less" href="/облик/страницы/' + название_страницы.escape_html() + '.css"/>')
		$.getScript('/javascripts/на страницах/' + название_страницы.escape_html() + '.js', function(data, status) {})
	}
	
	function вставить_пользовательское_содержимое(возврат)
	{
		вставить_содержимое('/лекала/user content.html', данные_для_страницы, возврат)
	}
	
	function вставить_гостевое_содержимое(возврат)
	{
		вставить_содержимое('/лекала/guest content.html', данные_для_страницы, возврат)
	}
	
	function вставить_содержимое(url, данные, возврат, options)
	{
		options = options || {}
		
		Ajax.get(url, 
		{
			type: 'html',
			error: function()
			{
				if (options.on_error)
					return options.on_error()
					
				page_loading_error('Что-то сломалось')
			},
			ok: function(template) 
			{
				$.template(url, template)
				
				if (options.before)
					options.before()
				
				$('footer').before($.tmpl(url, данные))
				
				возврат()
			}
		})
	}
	
	function page_loading_error(error)
	{
		var error = $('<div class="page_loading_error">' + error + '</div>')
		error.disableTextSelect()
		$('#loading_screen').attr('status', 'error').append(error)
	}
})