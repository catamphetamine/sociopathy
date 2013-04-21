url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Circles'
	
	tools.match(url,
	{
		'url.network': function(rest)
		{
			tools.match(rest,
			{
				'pages.circles.url section': function(rest)
				{
					tools.page('круги')
				}
			})
		}
	})
})