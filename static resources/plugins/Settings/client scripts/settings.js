url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Settings'

	match_url(url,
	{
		'сеть/настройки': function(rest)
		{
			tools.page('настройки')
		}
	})
})