url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'сеть/настройки': function(rest)
		{
			tools.page('настройки')
		}
	})
})