url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'сеть/мусорка': function(rest)
		{
			tools.page('мусорка')
		}
	})
})