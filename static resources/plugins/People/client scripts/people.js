Page_icon({ page: 'человек', icon: 'People' })

page_url_pattern('pages.people.url')
						
url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'People'

	tools.match(url,
	{
		'pages.people.url': function(rest)
		{
			if (!rest)
				return tools.page('люди')
				
			tools.match(rest,
			{
				'*': function(value, rest)
				{
					var int_value = parseInt(value)
					if (int_value == value && int_value > 0)
					{
						page.data.номер_страницы = int_value
						tools.page('люди')
					}
				}
			})
		}
	})
})