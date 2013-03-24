url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Trash'

	match_url(url,
	{
		'сеть/мусорка': function(rest)
		{
			tools.page('мусорка')
		}
	})
})