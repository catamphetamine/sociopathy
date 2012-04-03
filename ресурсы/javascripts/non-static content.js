var название_страницы = путь_страницы()
window.данные_для_страницы = {}

$(function()
{
	var кусочки = ['loading popup', 'simple value dialog window', 'unsupported browser popup', 'наглядный писарь', 'нижняя панель режима правки', 'окошко входа']
	var шаблоны = ['маленький аватар']
	
	if (!название_страницы)
		название_страницы = 'обложка'
		
	var данные_для_страницы = window.данные_для_страницы
	
	var breaks_from_normal_workflow = false
	
	match_url(путь_страницы(),
	{
		'люди': function(rest)
		{
			match_url(rest,
			{
				'*': function(value, rest)
				{
					window.адресное_имя = value
					название_страницы = 'человек/человек'
					
					match_url(rest,
					{
						'дневник': function(rest)
						{
							название_страницы = 'человек/дневник'
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
									window.альбом = value
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
									window.альбом = value
								}
							})
						},
						'общие друзья': function()
						{
							название_страницы = 'общие друзья'
						}
					})
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
					данные_для_страницы.путь = путь
					раздел_или_заметка(путь, proceed)
					breaks_from_normal_workflow = true
				}
			})
		}
	})
	
	if (!breaks_from_normal_workflow)
		proceed()

	function proceed()
	{
		данные_для_страницы.название_страницы = название_страницы
		window.название_страницы = название_страницы
			
		подгрузить_шаблоны(function()
		{
			if ($.cookie('user'))
			{
				получить_пользовательские_данные_для_страницы(function()
				{
					вставить_пользовательское_содержимое(function()
					{
						вставить_кусочки_и_содержимое_страницы()
					})
				})
			}
			else
				вставить_гостевое_содержимое(function()
				{
					вставить_кусочки_и_содержимое_страницы()
				})
		})
	}
	
	function вставить_кусочки_и_содержимое_страницы()
	{
		вставить_кусочки(function()
		{
			вставить_содержимое_страницы(function()
			{
				$(document).trigger('fully_loaded')
			})
		})
	}
	
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
				page_loading_error('Возможно что-то сломалось')
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
			вставить_содержимое('/страницы/кусочки/' + кусочек + '.html', данные_для_страницы, callback)
		})
	}

	function раздел_или_заметка(путь, возврат)
	{
		Ajax.get('/приложение/раздел или заметка?', { путь: путь })
		.ошибка(function(ошибка)
		{
			page_loading_error('Возможно что-то сломалось')
		})
		.ok(function(данные) 
		{
			if (данные.заметка)
			{
				название_страницы = 'заметка'
				window.заметка = данные.заметка
				данные_для_страницы = Object.merge(данные_для_страницы, данные)
			}
			else
			{
				название_страницы = 'читальня'
				window.раздел = данные.раздел
			}

			возврат()
		})
	}
	
	function получить_пользовательские_данные_для_страницы(возврат)
	{
		Ajax.get('/приложение/пользовательские_данные_для_страницы')
		.ошибка(function(ошибка)
		{
			// если кука user - кривая, то она уже сама удалилась на сервере,
			// и просто перезагрузить страницу, чтобы войти в качестве гостя
			if (ошибка === 'Пользователь не найден')
				return window.location.reload()
			
			page_loading_error('Возможно что-то сломалось')
		})
		.ok(function(данные) 
		{
			данные_для_страницы = Object.merge(данные_для_страницы, данные)
			
			пользователь = данные.пользователь
			
			if (!пользователь && название_страницы.starts_with('сеть/'))
				window.location = '/'

			возврат()
		})
	}

	function вставить_содержимое_страницы(возврат)
	{
		вставить_содержимое('/страницы/' + название_страницы + '.html', данные_для_страницы, возврат,
		{
			on_error: function()
			{
				название_страницы = 'страница не найдена'
				вставить_содержимое_страницы(возврат)
			},
			before: вставить_стиль_и_javascript
		})
	}
	
	function вставить_стиль_и_javascript(callback)
	{
		$('head').append('<link rel="stylesheet/less" href="/облик/страницы/' + название_страницы.escape_html() + '.css"/>')
	
		$.ajax
		({
			url: '/javascripts/на страницах/' + название_страницы.escape_html() + '.js',
			dataType: "script",
			success: function() { callback() },
			error: function() { alert('Page script not loaded (possible syntax error): ' + '/javascripts/на страницах/' + название_страницы.escape_html() + '.js') }
		})
	}
	
	function вставить_пользовательское_содержимое(возврат)
	{
		вставить_содержимое('/страницы/кусочки/user content.html', данные_для_страницы, возврат)
	}
	
	function вставить_гостевое_содержимое(возврат)
	{
		вставить_содержимое('/страницы/кусочки/guest content.html', данные_для_страницы, возврат)
	}
	
	function вставить_содержимое(url, данные, возврат, options)
	{
		options = options || {}
		
		Ajax.get(url, {}, { type: 'html' })
		.ошибка(function()
		{
			if (options.on_error)
				return options.on_error()
				
			page_loading_error('Возможно что-то сломалось')
		})
		.ok(function(template) 
		{
			$.template(url, template)
			
			var after = function()
			{
				$('footer').before($.tmpl(url, данные))
				возврат()
			}
			
			if (options.before)
				options.before(after)
			else
				after()
		})
	}
	
	function page_loading_error(error)
	{
		var error = $('<div class="page_loading_error">' + error + '</div>')
		error.disableTextSelect()
		$('#loading_screen').attr('status', 'error').append(error)
	}
})