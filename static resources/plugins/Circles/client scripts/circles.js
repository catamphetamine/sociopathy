url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Circles'
	
	match_url(url,
	{
		'сеть/круги': function(rest)
		{
			tools.page('круги')
		}
	})
})