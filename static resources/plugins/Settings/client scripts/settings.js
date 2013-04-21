Url_map['user settings'] = text('url.network') + '/' + text('pages.settings.url section')

url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Settings'

	tools.match(url, 
	{
		'url.network': function(rest)
		{
			tools.match(rest,
			{
				'pages.settings.url section': function(rest)
				{
					tools.page('настройки')
				}
			})
		}
	})
})