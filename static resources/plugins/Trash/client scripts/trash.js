url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Trash'

	tools.match(url,
	{
		'url.network': function(rest)
		{
			tools.match(rest,
			{
				'pages.trash.url section': function(rest)
				{
					tools.page('мусорка')
				}
			})
		}
	})
})