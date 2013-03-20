url_matcher(function(url)
{
	var tools = this

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
						'видео': function(rest)
						{
							tools.page('видео')
							
							match_url(rest,
							{
								'*': function(value, rest)
								{
									page.data.альбом = value
									page.data.видеозапись = rest
									
									tools.page('альбом с видео')
								}
							})
						}
					})
				}
			})
		}
	})
})