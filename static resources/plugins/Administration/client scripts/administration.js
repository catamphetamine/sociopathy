url_matcher(function(url)
{
	var tools = this
	
	match_url(url,
	{
		'сеть/управление': function(rest)
		{
			tools.page('управление')
		}
	})
})