(function()
{
	page_url_pattern('pages.library.url')

	//Url_map['library.category'] = function(id) { return text('pages.library.url') + '/' + id }
	Url_map['library.article.new'] = function(category) { return text('url.network') + '/' + text('pages.library.new article.url section') + '/' + category }

	function раздел_или_заметка(путь, resume)
	{
		page.Ajax.get('/приложение/раздел или заметка', { путь: путь })
		.ошибка(function(ошибка, options)
		{
			if (ошибка === 'not found')
				ошибка = 'Раздел или заметка «' + путь + '» не найдены'
			
			resume({ текст: ошибка, уровень: options.уровень })
		})
		.ok(function(данные) 
		{
			if (данные.заметка)
			{
				Страница.эта('Library/заметка')
				
				page.data.данные_для_страницы.заметка = данные.заметка
				page.data.путь_к_заметке = путь
				page.data.заметка = данные.заметка
			}
			else
			{
				Страница.эта('Library/читальня')
				
				page.data.раздел = данные.раздел
				page.data.путь_к_разделу = путь
			}

			resume()
		})
	}

	url_matcher(function(url)
	{
		var tools = this
	
		tools.id = 'Library'

		var initial_url = url
		
		tools.match(url,
		{
			'url.network': function(rest)
			{
				tools.match(rest,
				{
					'pages.library.new article.url section': function(rest)
					{
						tools.match(rest,
						{
							'*': function(value, rest)
							{
								page.data.раздел = value
								tools.page('написать заметку')
							}
						})
					}
				})
			},
			'pages.library.url': function(rest)
			{
				if (!rest)
					return tools.page('читальня')
			
				tools.match(rest,
				{
					'*': function()
					{
						var путь = initial_url.substring(initial_url.indexOf('/') + 1)
						
						page.data.путь = путь
						раздел_или_заметка(путь, tools.wait())
						
						tools.icon()
					}
				})
			}
		})
	})
})()