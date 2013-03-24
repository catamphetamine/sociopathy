(function()
{
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
		
		match_url(url,
		{
			'сеть/читальня/заметка': function(rest)
			{
				match_url(rest,
				{
					'*': function(value, rest)
					{
						page.data.раздел = value
						tools.page('написать заметку')
					}
				})
			},
			'читальня': function(rest)
			{
				if (!rest)
					return tools.page('читальня')
			
				match_url(rest,
				{
					'*': function()
					{
						var путь = initial_url.substring('читальня/'.length)
						
						page.data.путь = путь
						раздел_или_заметка(путь, tools.wait())
					}
				})
			}
		})
	})
})()