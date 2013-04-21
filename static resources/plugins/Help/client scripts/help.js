page_url_pattern('pages.help.url')

url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Help'

	tools.match(url,
	{
		'pages.help.url': function(rest)
		{
			if (!rest)
				return tools.page('помощь')
			
			tools.match(rest,
			{
				'*': function(value, rest)
				{
					tools.page('разделы/' + value)
				}
			})
		}
	})
})