url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Books'
	
	match_url(url,
	{
		'сеть/книги': function(rest)
		{
			if (!rest)
				return tools.page('книги')
				
			match_url(rest,
			{
				'*': function(value, rest)
				{
					var int_value = parseInt(value)
					if (int_value == value && int_value > 0)
					{
						new_page.data.номер_страницы = int_value
						return tools.page('книги')
					}
					
					// здесь можно пойти на адрес какой-то определённой книги
					tools.page('книги')
				}
			})
		}
	})
})