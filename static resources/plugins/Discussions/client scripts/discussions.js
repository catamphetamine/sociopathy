url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'сеть/обсуждения': function(rest)
		{
			if (!rest)
				return tools.page('обсуждения')
		
			match_url(rest,
			{
				'*': function(value, rest)
				{
					page.data.общение = { id: value }
					tools.page('обсуждение')
				}
			})
		}
	})
})