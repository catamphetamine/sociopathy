url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Books'
	
	tools.match(url,
	{
		'url.network': function(rest)
		{
			tools.match(rest,
			{
				'pages.books.url section': function(rest)
				{
					if (!rest)
						return tools.page('книги')
						
					tools.match(rest,
					{
						'*': function(value, rest)
						{
							var int_value = parseInt(value)
							if (int_value == value && int_value > 0)
							{
								page.data.номер_страницы = int_value
								return tools.page('книги')
							}
							
							// здесь можно пойти на адрес какой-то определённой книги
							tools.page('книги')
						}
					})
				}
			})
		}
	})
})