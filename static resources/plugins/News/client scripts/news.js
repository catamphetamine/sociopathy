url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'сеть/новости': function(rest)
		{
			tools.page('новости')
		}
	})
})