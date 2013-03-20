url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'помощь': function(rest)
		{
			if (!rest)
				return tools.page('помощь')
			
			match_url(rest,
			{
				'*': function(value, rest)
				{
					tools.page('разделы/' + value)
				}
			})
		}
	})
})