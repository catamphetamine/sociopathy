url_matcher(function(url)
{
	var tools = this

	match_url(url,
	{
		'сеть/беседы': function(rest)
		{
			if (!rest)
				return tools.page('беседы')
		
			match_url(rest,
			{
				'*': function(value, rest)
				{
					page.data.общение = { id: value }
					tools.page('беседа')
				}
			})
		}
	})
})