url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Bookshelf'
	
	match_url(url,
	{
		'люди': function(rest)
		{
			match_url(rest,
			{
				'*': function(value, rest)
				{
					match_url(rest,
					{
						'книги': function()
						{
							tools.page('книжный шкаф')
						}
					})
				}
			})
		}
	})
})