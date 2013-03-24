Page_icon({ page: 'человек', icon: 'People' })

url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'People'

	match_url(url,
	{
		'люди': function(rest)
		{
			if (!rest)
				return tools.page('люди')
				
			match_url(rest,
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