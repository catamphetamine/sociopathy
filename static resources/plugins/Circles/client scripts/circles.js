url_matcher(function(url)
{
	var tools = this
	
	match_url(url,
	{
		'сеть/круги': function(rest)
		{
			tools.page('круги')
		}
	})
})