url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'сеть/ошибки': function(rest)
		{
			tools.page('ошибки')
		}
	})
})